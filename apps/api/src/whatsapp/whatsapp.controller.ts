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
  ) {}

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
      const isAdmin = req.user?.userType === 'admin';

      const currentUser = await this.userModel.findOne({ where: { number: userPhone } });
      const primaryPhone = currentUser?.primaryPhone || userPhone;

      const dbSessions = await this.sessionModel.findAll({
        where: { dataType: 'creds', dataId: 'base' },
        attributes: ['phone', 'userNumber']
      });

      const activeSessions = [];
      const dbPhones = new Set<string>();

      for (const session of dbSessions) {
        if (!session.phone) continue;
        const cleanPhone = String(session.phone).replace(/\D/g, '');
        if (!cleanPhone) continue;

        const isOwner = isAdmin || session.userNumber === userPhone || cleanPhone === userPhone;
        if (!isOwner) continue;

        const liveStatus = this.whatsappService.getStatus(cleanPhone);

        if (liveStatus.status === 'connected') {
          dbPhones.add(cleanPhone);
          activeSessions.push({
            phone: cleanPhone,
            status: 'connected',
            isPrimary: cleanPhone === primaryPhone,
            qr: null,
            pairingCode: null
          });
        }
      }

      // Check live in-memory active sockets for this user
      for (const [phone, status] of this.whatsappService.sessionStatus.entries()) {
        const cleanPhone = String(phone).replace(/\D/g, '');
        if (!cleanPhone || dbPhones.has(cleanPhone)) continue;

        if (status.status === 'connected') {
          activeSessions.push({
            phone: cleanPhone,
            status: 'connected',
            isPrimary: cleanPhone === primaryPhone,
            qr: null,
            pairingCode: null
          });
        }
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

    const status = this.whatsappService.getStatus(targetPhone);
    return { status: true, message: 'Status fetched', result: { ...status, phone: targetPhone } };
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
    const primarySender = currentUser?.primaryPhone || userPhone;

    let sender = (body.from || primarySender).toString().replace(/\D/g, '');
    let sock = this.whatsappService.sessions.get(sender);

    if ((!sock || this.whatsappService.getStatus(sender).status !== 'connected') && primarySender !== sender) {
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
    const primarySender = currentUser?.primaryPhone || userPhone;

    const sender = (body.from || primarySender).toString().replace(/\D/g, '');

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
    const isAdmin = req.user?.userType === 'admin';
    const userPhone = (req.userNumber || '').toString().replace(/\D/g, '');
    const targetPhone = (!isAdmin || !phone ? userPhone : phone).toString().replace(/\D/g, '');

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
    const primarySender = currentUser?.primaryPhone || userPhone;

    const sender = (body.from || primarySender).toString().replace(/\D/g, '');
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
  async getChats(@Req() req: any) {
    try {
      const userPhone = (req.userNumber || '').toString().replace(/\D/g, '');
      const isAdmin = req.user?.userType === 'admin';

      const currentUser = await this.userModel.findOne({ where: { number: userPhone } });
      const primaryPhone = (currentUser?.primaryPhone || '').replace(/\D/g, '');

      const userSessions = await this.sessionModel.findAll({
        where: { dataType: 'creds', dataId: 'base', [Op.or]: [{ userNumber: userPhone }, { phone: userPhone }] },
        attributes: ['phone']
      });

      const userPhones = Array.from(new Set([
        userPhone,
        primaryPhone,
        ...userSessions.map(s => String(s.phone).replace(/\D/g, ''))
      ])).filter(Boolean);

      const whereCondition = isAdmin
        ? {}
        : {
            [Op.or]: [
              { sender: { [Op.in]: userPhones } },
              { receiver: { [Op.in]: userPhones } }
            ]
          };

      const logs = await this.messageLogModel.findAll({
        where: whereCondition,
        order: [['createdAt', 'DESC']],
        limit: 500,
      });

      const chatsMap = new Map<string, any>();

      // Active connected socket for profile picture & contact lookup
      const activeSock = this.whatsappService.sessions.get(primaryPhone) || Array.from(this.whatsappService.sessions.values())[0];

      for (const log of logs) {
        const isSenderUser = userPhones.includes(log.sender);
        const isReceiverUser = userPhones.includes(log.receiver);

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
            lastMessage: log.message || (log.mediaUrl ? '📷 Photo' : 'Message'),
            timestamp: log.createdAt || log.timestamp,
            status: log.status,
            profilePicUrl: null,
          });
        } else if (pushName) {
          const existing = chatsMap.get(cleanOther);
          if (!existing.name || existing.name === `+${cleanOther}`) {
            existing.name = pushName;
          }
        }
      }

      const chatArray = Array.from(chatsMap.values());

      // Query live contactsMap from Baileys socket store & database for any contact push name
      for (const c of chatArray) {
        const liveContactName = this.whatsappService.contactsMap.get(c.phone);
        if (liveContactName) {
          c.name = liveContactName;
        } else if (!c.name || c.name === `+${c.phone}`) {
          const contactMsg = await this.messageLogModel.findOne({
            where: {
              sender: c.phone,
              senderName: { [Op.ne]: null }
            },
            order: [['createdAt', 'DESC']]
          });
          if (contactMsg?.senderName && !contactMsg.senderName.startsWith('+')) {
            c.name = contactMsg.senderName;
          }
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

      return { status: true, message: 'Chats fetched successfully', result: chatArray };
    } catch (err: any) {
      console.error('❌ Error fetching chats:', err.message);
      return { status: false, message: err.message, result: [] };
    }
  }

  @Get('chats/:chatNumber')
  async getChatMessages(@Param('chatNumber') chatNumber: string, @Req() req: any) {
    try {
      const userPhone = (req.userNumber || '').toString().replace(/\D/g, '');
      const cleanOther = (chatNumber || '').replace(/\D/g, '');

      if (!cleanOther) {
        return { status: true, message: 'Invalid chat number', result: [] };
      }

      const currentUser = await this.userModel.findOne({ where: { number: userPhone } });
      const primaryPhone = (currentUser?.primaryPhone || '').replace(/\D/g, '');

      const userSessions = await this.sessionModel.findAll({
        where: { dataType: 'creds', dataId: 'base', [Op.or]: [{ userNumber: userPhone }, { phone: userPhone }] },
        attributes: ['phone']
      });

      const userPhones = Array.from(new Set([
        userPhone,
        primaryPhone,
        ...userSessions.map(s => String(s.phone).replace(/\D/g, ''))
      ])).filter(Boolean);

      const messages = await this.messageLogModel.findAll({
        where: {
          [Op.or]: [
            { sender: { [Op.in]: userPhones }, receiver: cleanOther },
            { sender: cleanOther, receiver: { [Op.in]: userPhones } },
            { sender: cleanOther, receiver: { [Op.like]: `%${cleanOther}%` } }
          ]
        },
        order: [['createdAt', 'ASC']],
        limit: 300,
      });

      return { status: true, message: 'Chat history fetched', result: messages };
    } catch (err: any) {
      console.error('❌ Error fetching chat messages:', err.message);
      return { status: false, message: err.message, result: [] };
    }
  }

  @Get('contact-profile')
  async getContactProfile(@Query('phone') phone: string, @Req() req: any) {
    try {
      const cleanPhone = (phone || '').replace(/\D/g, '');
      const userPhone = (req.userNumber || '').toString().replace(/\D/g, '');
      const currentUser = await this.userModel.findOne({ where: { number: userPhone } });
      const sender = currentUser?.primaryPhone || userPhone;

      const sock = this.whatsappService.sessions.get(sender) || Array.from(this.whatsappService.sessions.values())[0];

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
    const isAdmin = req.user?.userType === 'admin';

    const whereCondition = isAdmin
      ? {}
      : { sender: userPhone };

    const scheduled = await this.scheduledMessageModel.findAll({
      where: whereCondition,
      order: [['scheduleTime', 'ASC']]
    });

    return { message: 'Scheduled messages fetched', result: scheduled };
  }

  @Delete('scheduled-messages/:id')
  async deleteScheduledMessage(@Param('id') id: number, @Req() req: any) {
    await this.scheduledMessageModel.destroy({ where: { id } });
    return { status: true, message: 'Scheduled message cancelled and deleted' };
  }
}
