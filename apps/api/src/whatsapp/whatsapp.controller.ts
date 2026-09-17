import { Controller, Post, Get, Delete, Body, Query, Param, UseGuards, Req, HttpStatus, UseInterceptors, UploadedFile } from '@nestjs/common';
import { WhatsappService } from './whatsapp.service';
import { WhatsappUtils } from './whatsapp-utils';
import { TokenAuthGuard } from '../auth/guards/token-auth.guard';
import { AdminGuard } from '../auth/guards/admin.guard';
import { InjectModel } from '@nestjs/sequelize';
import { MessageLog } from '../database/models/MessageLog';
import { Stat } from '../database/models/Stat';
import { ScheduledMessage } from '../database/models/ScheduledMessage';
import { Session } from '../database/models/Session';
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

  @Post('connect-pair')
  async connectPair(@Body('phone') phone: string, @Req() req: any) {
    if (req.user?.isExpired) {
      return { status: false, message: 'Subscription expired. Please renew your plan on the Subscription page.', result: null };
    }

    try {
      const isAdmin = req.user?.userType === 'admin';
      const userPhone = (req.userNumber || '').toString().replace(/\D/g, '');
      const targetPhone = (!isAdmin || !phone ? userPhone : phone).toString().replace(/\D/g, '');

      console.log(`📡 Requesting pairing code for: ${targetPhone} (Owner: ${userPhone})`);

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

    const isAdmin = req.user?.userType === 'admin';
    const userPhone = (req.userNumber || '').toString().replace(/\D/g, '');
    const targetPhone = (!isAdmin || !phone ? userPhone : phone).toString().replace(/\D/g, '');

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

      let dbSessions = [];
      if (isAdmin) {
        dbSessions = await this.sessionModel.findAll({
          where: { dataType: 'creds', dataId: 'base' },
          attributes: ['phone', 'userNumber']
        });
      } else {
        dbSessions = await this.sessionModel.findAll({
          where: {
            dataType: 'creds',
            dataId: 'base',
            [Op.or]: [
              { userNumber: userPhone },
              { phone: userPhone }
            ]
          },
          attributes: ['phone', 'userNumber']
        });
      }

      const activeSessions = [];
      const dbPhones = new Set<string>();

      for (const session of dbSessions) {
        if (!session.phone) continue;
        const cleanPhone = String(session.phone).replace(/\D/g, '');
        if (!cleanPhone) continue;

        dbPhones.add(cleanPhone);
        const liveStatus = this.whatsappService.getStatus(cleanPhone);
        activeSessions.push({
          phone: cleanPhone,
          status: liveStatus.status || 'disconnected',
          qr: liveStatus.qr || null,
          pairingCode: liveStatus.pairingCode || null
        });
      }

      return { message: 'User sessions fetched', result: activeSessions };
    } catch (err: any) {
      console.error('❌ Error fetching user sessions:', err.message);
      return { message: 'Failed to fetch sessions', result: [] };
    }
  }

  @Get('session-status')
  async getSessionStatus(@Query('phone') phone: string, @Req() req: any) {
    const isAdmin = req.user?.userType === 'admin';
    const userPhone = (req.userNumber || '').toString().replace(/\D/g, '');
    const targetPhone = (!isAdmin || !phone ? userPhone : phone).toString().replace(/\D/g, '');

    const status = this.whatsappService.getStatus(targetPhone);
    return { message: 'Status fetched', result: { ...status, phone: targetPhone } };
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

    const isAdmin = req.user?.userType === 'admin';
    const userPhone = (req.userNumber || '').toString().replace(/\D/g, '');
    const sender = (!isAdmin || !body.from ? userPhone : body.from).toString().replace(/\D/g, '');

    const sock = this.whatsappService.sessions.get(sender);

    if (!sock || this.whatsappService.getStatus(sender).status !== 'connected') {
      return { status: false, message: `WhatsApp (${sender}) is disconnected.`, result: null };
    }

    const jid = body.phone.replace(/\D/g, '') + '@s.whatsapp.net';

    try {
      const messageOptions = await WhatsappUtils.prepareMessageOptions(body.message, body.mediaUrl, body.mediaType);

      if (!messageOptions) {
        return { status: false, message: 'Message content or media is required', result: null };
      }

      console.log(`📤 Sending message to ${jid}...`);
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

    const isAdmin = req.user?.userType === 'admin';
    const userPhone = (req.userNumber || '').toString().replace(/\D/g, '');
    const sender = (!isAdmin || !body.from ? userPhone : body.from).toString().replace(/\D/g, '');

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

    const isAdmin = req.user?.userType === 'admin';
    const userPhone = (req.userNumber || '').toString().replace(/\D/g, '');
    const sender = (!isAdmin || !body.from ? userPhone : body.from).toString().replace(/\D/g, '');

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

      const whereCondition = isAdmin
        ? {}
        : {
            [Op.or]: [
              { sender: userPhone },
              { receiver: userPhone }
            ]
          };

      const logs = await this.messageLogModel.findAll({
        where: whereCondition,
        order: [['createdAt', 'DESC']],
        limit: 500,
      });

      const chatsMap = new Map<string, any>();

      for (const log of logs) {
        const otherNumber = log.sender === userPhone ? log.receiver : log.sender;
        const cleanOther = (otherNumber || '').replace(/\D/g, '');

        if (!cleanOther || cleanOther === userPhone) continue;
        if (cleanOther.length < 10 || cleanOther.length > 13 || cleanOther.startsWith('1203')) continue;

        if (!chatsMap.has(cleanOther)) {
          chatsMap.set(cleanOther, {
            phone: cleanOther,
            lastMessage: log.message || (log.mediaUrl ? '📷 Media Attachment' : 'Message'),
            timestamp: log.createdAt || log.timestamp,
            status: log.status,
          });
        }
      }

      return { status: true, message: 'Chats fetched successfully', result: Array.from(chatsMap.values()) };
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

      const messages = await this.messageLogModel.findAll({
        where: {
          [Op.or]: [
            { sender: userPhone, receiver: cleanOther },
            { sender: cleanOther, receiver: userPhone },
            { sender: cleanOther, receiver: { [Op.like]: `%${userPhone}%` } }
          ]
        },
        order: [['createdAt', 'ASC']],
        limit: 200,
      });

      return { status: true, message: 'Chat history fetched', result: messages };
    } catch (err: any) {
      console.error('❌ Error fetching chat messages:', err.message);
      return { status: false, message: err.message, result: [] };
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
