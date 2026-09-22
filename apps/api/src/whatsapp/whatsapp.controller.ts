import { Controller, Post, Get, Delete, Body, Query, Param, UseGuards, Req, HttpStatus, UseInterceptors, UploadedFile, NotFoundException } from '@nestjs/common';
import { WhatsappService } from './whatsapp.service';
import { WhatsappUtils } from './whatsapp-utils';
import { TokenAuthGuard } from '../auth/guards/token-auth.guard';
import { AdminGuard } from '../auth/guards/admin.guard';
import { InjectModel } from '@nestjs/sequelize';
import { MessageLog } from '../database/models/MessageLog';
import { Stat } from '../database/models/Stat';
import { ScheduledMessage } from '../database/models/ScheduledMessage';
import { Session } from '../database/models/Session';
import { User } from '../database/models/User';
import { ContactName } from '../database/models/ContactName';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname, join } from 'path';
import * as fs from 'fs';
import { Op } from 'sequelize';

@Controller('whatsapp')
@UseGuards(TokenAuthGuard)
export class WhatsappController {
  constructor(
    private whatsappService: WhatsappService,
    @InjectModel(MessageLog)
    private messageLogModel: typeof MessageLog,
    @InjectModel(Stat)
    private statModel: typeof Stat,
    @InjectModel(ScheduledMessage)
    private scheduledMessageModel: typeof ScheduledMessage,
    @InjectModel(Session)
    private sessionModel: typeof Session,
    @InjectModel(User)
    private userModel: typeof User,
    @InjectModel(ContactName)
    private contactNameModel: typeof ContactName,
  ) {}

  private mediaPreview(type?: string) {
    if (type === 'image') return '📷 Photo';
    if (type === 'video') return '🎥 Video';
    if (type === 'audio') return '🎤 Voice message';
    if (type === 'document') return '📄 Document';
    return 'Message';
  }

  private async listOwnedPhones(userPhone: string): Promise<Set<string>> {
    const phones = new Set<string>();
    if (userPhone) phones.add(userPhone);

    const dbSessions = await this.sessionModel.findAll({
      where: {
        dataType: 'creds',
        dataId: 'base',
        [Op.or]: [{ userNumber: userPhone }, { phone: userPhone }],
      },
      attributes: ['phone'],
    });

    for (const session of dbSessions) {
      const clean = String(session.phone || '').replace(/\D/g, '');
      if (clean) phones.add(clean);
    }

    for (const [phone, status] of this.whatsappService.sessionStatus.entries()) {
      const clean = String(phone).replace(/\D/g, '');
      const owner = String(status?.ownerUserNumber || '').replace(/\D/g, '');
      if (clean && (clean === userPhone || owner === userPhone)) phones.add(clean);
    }

    return phones;
  }

  private async listConnectedPhones(userPhone: string): Promise<string[]> {
    const owned = await this.listOwnedPhones(userPhone);
    const connected: string[] = [];

    for (const phone of owned) {
      const status = this.whatsappService.getStatus(phone);
      if (status?.status !== 'connected') continue;

      const owner = String(status.ownerUserNumber || '').replace(/\D/g, '');
      if (owner && owner !== userPhone) continue;

      connected.push(phone);
    }

    return connected;
  }

  private async resolveConnectedPhone(userPhone: string, requested?: string): Promise<string | null> {
    const connected = await this.listConnectedPhones(userPhone);
    const cleanRequested = (requested || '').replace(/\D/g, '');
    if (cleanRequested && connected.includes(cleanRequested)) return cleanRequested;

    const currentUser = await this.userModel.findOne({ where: { number: userPhone } });
    const primary = (currentUser?.primaryPhone || '').replace(/\D/g, '');
    if (primary && connected.includes(primary)) return primary;

    return connected[0] || null;
  }

  private async isOwnedByAnotherUser(userPhone: string, targetPhone: string): Promise<boolean> {
    if (!targetPhone || targetPhone === userPhone) return false;

    const status = this.whatsappService.getStatus(targetPhone);
    const liveOwner = String(status?.ownerUserNumber || '').replace(/\D/g, '');
    if (liveOwner && liveOwner !== userPhone) return true;
    if (!liveOwner && status?.status === 'connected') return true;

    const session = await this.sessionModel.findOne({
      where: { phone: targetPhone, dataType: 'creds', dataId: 'base' },
      attributes: ['userNumber'],
    });
    const owner = String(session?.userNumber || '').replace(/\D/g, '');
    return !!owner && owner !== userPhone;
  }

  @Post('upload')
  @UseInterceptors(FileInterceptor('file', {
    storage: diskStorage({
      destination: './uploads',
      filename: (req, file, cb) => {
        const randomName = Array(32).fill(null).map(() => (Math.round(Math.random() * 16)).toString(16)).join('');
        cb(null, `${randomName}${extname(file.originalname)}`);
      },
    }),
  }))
  async uploadFile(@UploadedFile() file: any) {
    const apiUrl = process.env.API_URL || 'http://localhost:5001';
    const url = `${apiUrl}/uploads/${file.filename}`;
    return {
      message: 'File uploaded successfully',
      result: {
        url,
        type: file.mimetype.split('/')[0] === 'application' ? 'document' : file.mimetype.split('/')[0]
      }
    };
  }

  @Post('set-primary')
  async setPrimaryPhone(@Body('phone') phone: string, @Req() req: any) {
    const userPhone = (req.userNumber || '').toString().replace(/\D/g, '');
    const user = await this.userModel.findOne({ where: { number: userPhone } });
    if (!user) throw new NotFoundException('User not found');

    const cleanPhone = (phone || userPhone).toString().replace(/\D/g, '');
    const owned = await this.listOwnedPhones(userPhone);
    if (!owned.has(cleanPhone)) {
      return { status: false, message: 'You can only set a WhatsApp number connected to your account as primary.', result: null };
    }
    await user.update({ primaryPhone: cleanPhone });

    return { status: true, message: `Primary WhatsApp sender set to +${cleanPhone}` };
  }

  @Post('connect-pair')
  async connectPair(@Body('phone') phone: string, @Req() req: any) {
    if (req.user?.isExpired) {
      return { status: false, message: 'Subscription expired. Please renew your plan on the Subscription page.', result: null };
    }

    try {
      const userPhone = (req.userNumber || '').toString().replace(/\D/g, '');
      const targetPhone = (phone || userPhone).toString().replace(/\D/g, '');

      if (await this.isOwnedByAnotherUser(userPhone, targetPhone)) {
        return { status: false, message: 'This WhatsApp number is already connected to another account.', result: null };
      }

      console.log(`📡 Requesting pairing code for target: ${targetPhone} (Owner Account: ${userPhone})`);

      await this.whatsappService.forceLogout(targetPhone);
      const sock = await this.whatsappService.initWhatsApp(targetPhone, userPhone);

      // Wait for socket to be ready
      await new Promise((r) => setTimeout(r, 6000));

      if (sock && !sock.authState.creds.registered) {
        const code = await sock.requestPairingCode(targetPhone);
        const currentStatus = this.whatsappService.sessionStatus.get(targetPhone) || {};
        this.whatsappService.sessionStatus.set(targetPhone, {
          ...currentStatus,
          status: 'pairing',
          pairingCode: code
        });
        return { message: 'Pairing code generated', result: { pairingCode: code } };
      } else {
        return { message: 'Already connected', result: { status: 'connected' } };
      }
    } catch (err) {
      console.error(`❌ Pairing Code Error:`, err.message);
      return { message: 'Failed to generate pairing code', result: null };
    }
  }

  @Post('connect-qr')
  async connectQr(@Body('phone') phone: string, @Req() req: any) {
    if (req.user?.isExpired) {
      return { status: false, message: 'Subscription expired. Please renew your plan on the Subscription page.', result: null };
    }

    const userPhone = (req.userNumber || '').toString().replace(/\D/g, '');
    const targetPhone = (phone || userPhone).toString().replace(/\D/g, '');

    if (await this.isOwnedByAnotherUser(userPhone, targetPhone)) {
      return { status: false, message: 'This WhatsApp number is already connected to another account.', result: null };
    }

    await this.whatsappService.forceLogout(targetPhone);
    await this.whatsappService.initWhatsApp(targetPhone, userPhone);

    // Poll for QR
    for (let i = 0; i < 30; i++) {
      const status = this.whatsappService.getStatus(targetPhone);
      if (status.qr) {
        return { message: 'QR generated', result: { qr: status.qr } };
      }
      await new Promise((r) => setTimeout(r, 1000));
    }
    return { message: 'QR Timeout', result: null };
  }

  @Get('user-sessions')
  async getUserSessions(@Req() req: any) {
    try {
      const userPhone = (req.userNumber || '').toString().replace(/\D/g, '');

      const currentUser = await this.userModel.findOne({ where: { number: userPhone } });
      const primaryPhone = (currentUser?.primaryPhone || userPhone || '').toString().replace(/\D/g, '');
      const ownedPhones = await this.listOwnedPhones(userPhone);

      const activeSessions = [];
      const seen = new Set<string>();

      for (const cleanPhone of ownedPhones) {
        if (!cleanPhone || seen.has(cleanPhone)) continue;
        const liveStatus = this.whatsappService.getStatus(cleanPhone);
        if (liveStatus.status !== 'connected') continue;

        seen.add(cleanPhone);
        activeSessions.push({
          phone: cleanPhone,
          status: 'connected',
          isPrimary: cleanPhone === primaryPhone,
          qr: null,
          pairingCode: null
        });
      }

      return { status: true, message: 'User sessions fetched', result: activeSessions };
    } catch (err: any) {
      console.error('❌ Error fetching user sessions:', err.message);
      return { status: false, message: 'Failed to fetch sessions', result: [] };
    }
  }

  @Get('session-status')
  async getSessionStatus(@Query('phone') phone: string, @Req() req: any) {
    const userPhone = (req.userNumber || '').toString().replace(/\D/g, '');
    const targetPhone = (phone || userPhone).toString().replace(/\D/g, '');
    const owned = await this.listOwnedPhones(userPhone);

    if (!owned.has(targetPhone)) {
      return { status: true, message: 'Status fetched', result: { status: 'not_connected', phone: targetPhone, qr: null, pairingCode: null } };
    }

    const status = this.whatsappService.getStatus(targetPhone);
    const { ownerUserNumber, ...safeStatus } = status || {};
    return { status: true, message: 'Status fetched', result: { ...safeStatus, phone: targetPhone } };
  }

  @Get('sessions')
  @UseGuards(AdminGuard)
  async getAllSessions() {
    const allStatus = Object.fromEntries(this.whatsappService.sessionStatus);
    return { message: 'Active sessions list', result: allStatus };
  }

  @Post('send-message')
  async sendMessage(@Body() body: { phone: string; message: string; from?: string; mediaUrl?: string; mediaType?: string }, @Req() req: any) {
    if (req.user?.isExpired) {
      return { status: false, message: 'Subscription expired. Please renew your plan on the Subscription page.', result: null };
    }

    const userPhone = (req.userNumber || '').toString().replace(/\D/g, '');
    const currentUser = await this.userModel.findOne({ where: { number: userPhone } });
    const primarySender = (currentUser?.primaryPhone || userPhone).toString().replace(/\D/g, '');
    const owned = await this.listOwnedPhones(userPhone);

    let sender = (body.from || primarySender).toString().replace(/\D/g, '');
    if (!owned.has(sender)) sender = primarySender;
    if (!owned.has(sender)) {
      return { status: false, message: 'This WhatsApp connection does not belong to your account.', result: null };
    }

    let sock = this.whatsappService.sessions.get(sender);

    if ((!sock || this.whatsappService.getStatus(sender).status !== 'connected') && primarySender !== sender && owned.has(primarySender)) {
      sender = primarySender;
      sock = this.whatsappService.sessions.get(sender);
    }

    if (!sock || this.whatsappService.getStatus(sender).status !== 'connected') {
      return { status: false, message: `Primary WhatsApp device (+${sender}) is disconnected. Please connect on Connections page.`, result: null };
    }

    const jid = body.phone.replace(/\D/g, '') + '@s.whatsapp.net';

    try {
      const messageOptions = await WhatsappUtils.prepareMessageOptions(body.message, body.mediaUrl, body.mediaType);

      if (!messageOptions) {
        return { status: false, message: 'Message content or media is required', result: null };
      }

      console.log(`📤 Sending message to ${jid} from Primary Sender (+${sender})...`);
      const result = await sock.sendMessage(jid, messageOptions);

      await this.messageLogModel.create({
        sender,
        receiver: body.phone,
        message: body.message || '',
        status: 'sent',
        mediaUrl: body.mediaUrl,
        mediaType: body.mediaType,
        messageId: result?.key?.id
      });

      const [stat] = await this.statModel.findOrCreate({ where: { id: 1 }, defaults: { totalMessagesSent: 0 } });
      await stat.increment('totalMessagesSent');

      return { status: true, message: 'Message sent successfully', result };
    } catch (err) {
      console.error(`❌ Send Message Error:`, err.message);
      return { status: false, message: 'Failed to send message: ' + err.message, result: null };
    }
  }

  @Post('broadcast')
  async broadcast(@Body() body: { numbers: string[]; message: string; from?: string; mediaUrl?: string; mediaType?: string }, @Req() req: any) {
    if (req.user?.isExpired) {
      return { status: false, message: 'Subscription expired. Please renew your plan on the Subscription page.', result: null };
    }

    const userPhone = (req.userNumber || '').toString().replace(/\D/g, '');
    const currentUser = await this.userModel.findOne({ where: { number: userPhone } });
    const primarySender = (currentUser?.primaryPhone || userPhone).toString().replace(/\D/g, '');
    const owned = await this.listOwnedPhones(userPhone);

    let sender = (body.from || primarySender).toString().replace(/\D/g, '');
    if (!owned.has(sender)) sender = primarySender;
    if (!owned.has(sender)) {
      return { status: false, message: 'This WhatsApp connection does not belong to your account.', result: null };
    }

    try {
      const results = await this.whatsappService.broadcast(
        sender,
        body.numbers,
        body.message,
        this.messageLogModel,
        this.statModel,
        body.mediaUrl,
        body.mediaType
      );
      return { message: 'Broadcast processed', result: { total: body.numbers.length, results } };
    } catch (err) {
      return { message: err.message, result: null };
    }
  }

  @Post('logout')
  async logout(@Body('phone') phone: string, @Req() req: any) {
    const userPhone = (req.userNumber || '').toString().replace(/\D/g, '');
    const targetPhone = (phone || userPhone).toString().replace(/\D/g, '');
    const owned = await this.listOwnedPhones(userPhone);

    if (!owned.has(targetPhone)) {
      return { status: false, message: 'You can only disconnect a WhatsApp number connected to your account.', result: null };
    }

    await this.whatsappService.forceLogout(targetPhone);
    return { message: 'Logged out successfully' };
  }

  @Post('schedule-message')
  async scheduleMessage(@Body() body: { phone: string; message: string; scheduleTime: string | number; from?: string; mediaUrl?: string; mediaType?: string }, @Req() req: any) {
    if (req.user?.isExpired) {
      return { status: false, message: 'Subscription expired. Please renew your plan on the Subscription page.', result: null };
    }

    const userPhone = (req.userNumber || '').toString().replace(/\D/g, '');
    const currentUser = await this.userModel.findOne({ where: { number: userPhone } });
    const primarySender = (currentUser?.primaryPhone || userPhone).toString().replace(/\D/g, '');
    const owned = await this.listOwnedPhones(userPhone);

    let sender = (body.from || primarySender).toString().replace(/\D/g, '');
    if (!owned.has(sender)) sender = primarySender;
    if (!owned.has(sender)) {
      return { status: false, message: 'This WhatsApp connection does not belong to your account.', result: null };
    }
    const cleanReceiver = body.phone.replace(/\D/g, '');

    const timeInMs = typeof body.scheduleTime === 'number'
      ? body.scheduleTime
      : new Date(body.scheduleTime).getTime();

    if (isNaN(timeInMs) || timeInMs <= Date.now()) {
      return { status: false, message: 'Schedule time must be in the future', result: null };
    }

    const scheduled = await this.scheduledMessageModel.create({
      sender,
      receiver: cleanReceiver,
      message: body.message || '',
      mediaUrl: body.mediaUrl || null,
      mediaType: body.mediaType || null,
      scheduleTime: timeInMs,
      status: 'pending'
    });

    return { status: true, message: 'Message scheduled successfully', result: scheduled };
  }

  @Get('chats')
  async getChats(@Query('phone') phone: string, @Req() req: any) {
    try {
      const userPhone = (req.userNumber || '').toString().replace(/\D/g, '');
      const connectedPhones = await this.listConnectedPhones(userPhone);
      const activePhone = await this.resolveConnectedPhone(userPhone, phone);

      if (!activePhone) {
        return {
          status: true,
          message: 'No WhatsApp connection',
          result: { chats: [], connectedPhone: null, connectedPhones },
        };
      }

      const userPhones = [activePhone];

      const whereCondition = {
        [Op.or]: [
          { sender: activePhone },
          { receiver: activePhone },
        ]
      };

      const logs = await this.messageLogModel.findAll({
        where: whereCondition,
        order: [['createdAt', 'DESC']],
        limit: 2000,
      });

      const chatsMap = new Map<string, any>();

      const activeSock = this.whatsappService.sessions.get(activePhone);

      for (const log of logs) {
        const isSenderUser = log.sender === activePhone;
        const isReceiverUser = log.receiver === activePhone;

        let cleanOther = '';
        const pushName = log.senderName && !log.senderName.startsWith('+') ? log.senderName : null;

        if (isSenderUser && !isReceiverUser) {
          cleanOther = (log.receiver || '').replace(/\D/g, '');
        } else if (!isSenderUser && isReceiverUser) {
          cleanOther = (log.sender || '').replace(/\D/g, '');
        } else if (!isSenderUser && !isReceiverUser) {
          cleanOther = (log.sender || '').replace(/\D/g, '');
        }

        if (!cleanOther || userPhones.includes(cleanOther)) continue;
        if (cleanOther.length < 10 || cleanOther.length > 13 || cleanOther.startsWith('1203')) continue;

        if (!chatsMap.has(cleanOther)) {
          chatsMap.set(cleanOther, {
            phone: cleanOther,
            name: pushName || `+${cleanOther}`,
            lastMessage: log.message || this.mediaPreview(log.mediaType),
            timestamp: log.createdAt || log.timestamp,
            status: log.status,
            profilePicUrl: null,
            accountPhone: activePhone,
          });
        } else if (pushName) {
          const existing = chatsMap.get(cleanOther);
          if (!existing.name || existing.name === `+${cleanOther}`) {
            existing.name = pushName;
          }
        }
      }

      const chatArray = Array.from(chatsMap.values()).sort(
        (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime(),
      );

      const chatPhones = chatArray.map((c) => c.phone);
      const savedNames = chatPhones.length
        ? await this.contactNameModel.findAll({
            where: { accountPhone: activePhone, phone: { [Op.in]: chatPhones } },
            attributes: ['phone', 'name'],
          })
        : [];
      const nameByPhone = new Map(savedNames.map((row) => [row.phone, row.name]));

      if (chatPhones.length) {
        const namedMessages = await this.messageLogModel.findAll({
          where: {
            sender: { [Op.in]: chatPhones },
            receiver: activePhone,
            senderName: { [Op.ne]: null },
          },
          attributes: ['sender', 'senderName'],
          order: [['createdAt', 'DESC']],
        });
        for (const row of namedMessages) {
          if (row.senderName && !row.senderName.startsWith('+') && !nameByPhone.has(row.sender)) {
            nameByPhone.set(row.sender, row.senderName);
          }
        }
      }

      for (const c of chatArray) {
        const liveContactName = this.whatsappService.contactDisplayName(activePhone, c.phone) || nameByPhone.get(c.phone);
        if (liveContactName) {
          c.name = liveContactName;
        }
      }

      // Fetch live profile pictures for recent contacts from active Baileys socket with timeout
      if (activeSock) {
        await Promise.all(
          chatArray.slice(0, 15).map(async (c) => {
            try {
              const jid = c.phone + '@s.whatsapp.net';
              const picPromise = activeSock.profilePictureUrl(jid, 'image');
              const timeoutPromise = new Promise((resolve) => setTimeout(() => resolve(null), 1500));
              const picUrl = await Promise.race([picPromise, timeoutPromise]).catch(() => null);
              if (picUrl && typeof picUrl === 'string') {
                c.profilePicUrl = picUrl;
              }
            } catch (e) {}
          })
        );
      }

      return {
        status: true,
        message: 'Chats fetched successfully',
        result: { chats: chatArray, connectedPhone: activePhone, connectedPhones },
      };
    } catch (err: any) {
      console.error('❌ Error fetching chats:', err.message);
      return { status: false, message: err.message, result: [] };
    }
  }

  @Get('chats/:chatNumber')
  async getChatMessages(@Param('chatNumber') chatNumber: string, @Query('phone') phone: string, @Req() req: any) {
    try {
      const userPhone = (req.userNumber || '').toString().replace(/\D/g, '');
      const cleanOther = (chatNumber || '').replace(/\D/g, '');
      const activePhone = await this.resolveConnectedPhone(userPhone, phone);

      if (!cleanOther || !activePhone) {
        return { status: true, message: 'No WhatsApp connection', result: { messages: [], connectedPhone: activePhone } };
      }

      const messages = await this.messageLogModel.findAll({
        where: {
          [Op.or]: [
            { sender: activePhone, receiver: cleanOther },
            { sender: cleanOther, receiver: activePhone }
          ]
        },
        order: [['createdAt', 'ASC']],
        limit: 300,
      });

      return { status: true, message: 'Chat history fetched', result: { messages, connectedPhone: activePhone } };
    } catch (err: any) {
      console.error('❌ Error fetching chat messages:', err.message);
      return { status: false, message: err.message, result: [] };
    }
  }

  @Get('contact-profile')
  async getContactProfile(@Query('phone') phone: string, @Query('account') account: string, @Req() req: any) {
    try {
      const cleanPhone = (phone || '').replace(/\D/g, '');
      const userPhone = (req.userNumber || '').toString().replace(/\D/g, '');
      const accountPhone = await this.resolveConnectedPhone(userPhone, account);
      const sock = accountPhone ? this.whatsappService.sessions.get(accountPhone) : null;

      if (!sock) return { status: true, result: { phone: cleanPhone, profilePicUrl: null } };

      const jid = cleanPhone + '@s.whatsapp.net';
      const picPromise = sock.profilePictureUrl(jid, 'image');
      const timeoutPromise = new Promise((resolve) => setTimeout(() => resolve(null), 2000));
      const profilePicUrl = await Promise.race([picPromise, timeoutPromise]).catch(() => null);

      return { status: true, result: { phone: cleanPhone, profilePicUrl: typeof profilePicUrl === 'string' ? profilePicUrl : null } };
    } catch (e) {
      return { status: true, result: { phone: phone, profilePicUrl: null } };
    }
  }

  @Get('scheduled-messages')
  async getScheduledMessages(@Req() req: any) {
    const userPhone = (req.userNumber || '').toString().replace(/\D/g, '');
    const owned = await this.listOwnedPhones(userPhone);

    const scheduled = await this.scheduledMessageModel.findAll({
      where: { sender: { [Op.in]: Array.from(owned) } },
      order: [['scheduleTime', 'ASC']]
    });

    return { message: 'Scheduled messages fetched', result: scheduled };
  }

  @Delete('scheduled-messages/:id')
  async deleteScheduledMessage(@Param('id') id: number, @Req() req: any) {
    const userPhone = (req.userNumber || '').toString().replace(/\D/g, '');
    const owned = await this.listOwnedPhones(userPhone);
    await this.scheduledMessageModel.destroy({
      where: { id, sender: { [Op.in]: Array.from(owned) } },
    });
    return { status: true, message: 'Scheduled message cancelled and deleted' };
  }
}
