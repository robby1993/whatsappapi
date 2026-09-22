import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Op } from 'sequelize';
import axios from 'axios';
import { downloadMediaMessage, extensionForMediaMessage } from '@whiskeysockets/baileys';
import { mkdir, writeFile } from 'fs/promises';
import { join } from 'path';
import pino from 'pino';
import { ChatFlow } from '../database/models/ChatFlow';
import { ChatSession } from '../database/models/ChatSession';
import { User } from '../database/models/User';
import { MessageLog } from '../database/models/MessageLog';
import { Stat } from '../database/models/Stat';
import { WhatsappUtils } from './whatsapp-utils';

@Injectable()
export class IncomingMessageHandler {
  private readonly SESSION_TIMEOUT_MS = 30 * 60 * 1000; // 30 Minutes
  private readonly mediaLogger = pino({ level: 'silent' });
  private mediaChain: Promise<void> = Promise.resolve();

  constructor(
    @InjectModel(ChatFlow)
    private chatFlowModel: typeof ChatFlow,
    @InjectModel(ChatSession)
    private chatSessionModel: typeof ChatSession,
    @InjectModel(User)
    private userModel: typeof User,
    @InjectModel(MessageLog)
    private messageLogModel: typeof MessageLog,
    @InjectModel(Stat)
    private statModel: typeof Stat,
  ) {}

  /**
   * Saves historical messages during Baileys full history sync.
   */
  async saveHistoryMessage(botPhone: string, msg: any, sock?: any) {
    try {
      await this.persistChatMessage(botPhone, msg, sock, false);
    } catch (e) {
      // Ignore single history message save error
    }
  }

  /**
   * Main entry point for processing incoming messages.
   */
  async handle(botPhone: string, sock: any, m: any) {
    try {
      if (!m.messages || m.messages.length === 0) return;

      for (const msg of m.messages) {
        let msgContent = msg.message;
        if (!msgContent) continue;

        // Unwrap nested messages (ephemeral, view-once, etc.)
        msgContent = this.unwrapMessage(msgContent);
        if (!msgContent) continue;

        const senderJid = msg.key?.remoteJid || '';
        const text = this.extractText(msgContent);
        const isFromMe = msg.key?.fromMe;
        const saved = await this.persistChatMessage(botPhone, msg, sock, true);

        if (isFromMe || !saved?.text) continue;

        // 0. Handle Global Commands (Exit/Restart)
        if (this.isGlobalCommand(text)) {
           await this.chatSessionModel.destroy({ where: { senderJid, botPhone } });
           if (text.toLowerCase() === 'restart') {
              // Continue to start a new flow
           } else {
              await sock.sendMessage(senderJid, { text: 'Session ended. You can start again by sending a keyword.' });
              continue;
           }
        }

        // 1. Session Management (Check existing & Timeout)
        let session = await this.chatSessionModel.findOne({
          where: { senderJid, botPhone, currentFlowId: { [Op.ne]: null } }
        });

        if (session) {
          const isTimedOut = new Date().getTime() - new Date(session.lastInteraction).getTime() > this.SESSION_TIMEOUT_MS;
          if (isTimedOut) {
            console.log(`⏰ Session timed out for ${senderJid}`);
            await session.destroy();
            session = null;
          }
        }

        // 2. Process existing session or attempt to match new flow
        if (session) {
          await this.processSession(sock, session, text);
        } else {
          const matchedFlow = await this.findMatchingFlow(botPhone, text);
          if (matchedFlow) {
            console.log(`🎯 Flow Triggered: ${matchedFlow.name}`);
            session = await this.chatSessionModel.create({
              senderJid,
              botPhone,
              currentFlowId: matchedFlow.id,
              currentStepIndex: 0,
              context: {},
              lastInteraction: new Date()
            });
            await this.executeFlowSteps(sock, matchedFlow, session);
          } else {
            // 3. Fallback logic
            await this.handleFallback(botPhone, sock, senderJid, text);
          }
        }

        // Webhook and Logging
        this.handleWebhooks(botPhone, senderJid, text, msgContent, msg.messageTimestamp);
      }
    } catch (err) {
      console.error('❌ Incoming Message Error:', err.message);
    }
  }

  private cleanChatPhone(jid: string): string {
    const value = String(jid || '');
    if (!value || value.includes('@g.us') || value.includes('@broadcast') || value.endsWith('@lid')) return '';
    const digits = value.replace(/@.*$/, '').replace(/\D/g, '');
    if (digits.length < 10 || digits.length > 15 || digits.startsWith('1203')) return '';
    return digits;
  }

  private describeMedia(msgContent: any): { type: string } | null {
    if (!msgContent) return null;
    if (msgContent.imageMessage || msgContent.stickerMessage) return { type: 'image' };
    if (msgContent.videoMessage) return { type: 'video' };
    if (msgContent.audioMessage) return { type: 'audio' };
    if (msgContent.documentMessage) return { type: 'document' };
    return null;
  }

  private async persistChatMessage(botPhone: string, msg: any, sock: any, awaitDownload: boolean) {
    if (!msg?.message) return null;
    const msgContent = this.unwrapMessage(msg.message);
    if (!msgContent) return null;

    const text = this.extractText(msgContent);
    if (text.toLowerCase().includes('waiting for this message')) return null;
    const media = this.describeMedia(msgContent);
    if (!text && !media) return null;

    const cleanRemote = this.cleanChatPhone(msg.key?.remoteJid || '');
    const cleanBotPhone = String(botPhone || '').replace(/\D/g, '');
    if (!cleanRemote || !cleanBotPhone) return null;

    const isFromMe = !!msg.key?.fromMe;
    const sender = isFromMe ? cleanBotPhone : cleanRemote;
    const receiver = isFromMe ? cleanRemote : cleanBotPhone;
    const pushName = !isFromMe && msg.pushName && !String(msg.pushName).startsWith('+')
      ? String(msg.pushName).trim()
      : null;
    const msgId = msg.key?.id || `msg_${Date.now()}_${Math.random()}`;
    const timestamp = Number(msg.messageTimestamp || Math.floor(Date.now() / 1000));

    const existing = await this.messageLogModel.findOne({ where: { messageId: msgId } });
    const row = existing || await this.messageLogModel.create({
      sender,
      senderName: pushName,
      receiver,
      message: text,
      mediaType: media?.type || null,
      status: isFromMe ? 'sent' : 'received',
      messageId: msgId,
      timestamp,
    });

    if (existing) {
      const updates: any = {};
      if (pushName && !existing.senderName) updates.senderName = pushName;
      if (media?.type && !existing.mediaType) updates.mediaType = media.type;
      if (!existing.message && text) updates.message = text;
      if (Object.keys(updates).length) await existing.update(updates);
    }

    if (media && sock && !row.mediaUrl) {
      const task = () => this.downloadMessageMedia(sock, msg, msgContent, msgId);
      if (awaitDownload) await task().catch((err: any) => {
        console.error(`Media download failed for ${msgId}:`, err?.message || err);
      });
      else this.mediaChain = this.mediaChain.then(task).catch((err: any) => {
        console.error(`Media download failed for ${msgId}:`, err?.message || err);
      });
    }

    return { text };
  }

  private fetchMediaBuffer(sock: any, msg: any) {
    return downloadMediaMessage(
      msg,
      'buffer',
      {},
      {
        logger: this.mediaLogger,
        reuploadRequest: (message: any) => sock.updateMediaMessage(message),
      },
    );
  }

  private async downloadMessageMedia(sock: any, msg: any, msgContent: any, msgId: string) {
    let buffer: Buffer;
    try {
      buffer = await this.fetchMediaBuffer(sock, msg);
    } catch (err: any) {
      const status = err?.response?.status || err?.output?.statusCode;
      if (![403, 404, 410].includes(status) || !sock?.updateMediaMessage) throw err;
      const refreshed = await sock.updateMediaMessage(msg);
      buffer = await this.fetchMediaBuffer(sock, refreshed);
    }
    let ext = '.bin';
    try {
      const rawExt = extensionForMediaMessage(msgContent) || '.bin';
      ext = rawExt.startsWith('.') ? rawExt.split(';')[0] : `.${String(rawExt).split(';')[0]}`;
    } catch (e) {}
    const filename = `${String(msgId).replace(/[^\w.-]/g, '')}${ext}`;
    const dir = join(process.cwd(), 'uploads');
    await mkdir(dir, { recursive: true });
    await writeFile(join(dir, filename), buffer);
    const apiUrl = process.env.API_URL || 'http://localhost:5001';
    const kind = this.describeMedia(msgContent);
    await this.messageLogModel.update(
      { mediaUrl: `${apiUrl}/uploads/${filename}`, mediaType: kind?.type || 'document' },
      { where: { messageId: msgId } },
    );
    console.log(`📎 Saved ${kind?.type || 'file'} for ${msgId}`);
  }

  private async processSession(sock: any, session: ChatSession, userInput: string) {
    const flow = await this.chatFlowModel.findByPk(session.currentFlowId);
    if (!flow || !flow.isActive) {
      await session.destroy();
      return;
    }

    const currentStep = flow.steps[session.currentStepIndex];

    if (currentStep?.wait) {
      const context = session.context || {};
      if (currentStep.key) {
        context[currentStep.key] = userInput;
      }

      session.context = context;
      session.currentStepIndex += 1;
      session.lastInteraction = new Date();
      await session.save();

      await this.executeFlowSteps(sock, flow, session);
    } else {
      session.currentStepIndex += 1;
      await session.save();
      await this.executeFlowSteps(sock, flow, session);
    }
  }

  private async executeFlowSteps(sock: any, flow: ChatFlow, session: ChatSession) {
    const senderJid = session.senderJid;

    while (session.currentStepIndex < flow.steps.length) {
      const step = flow.steps[session.currentStepIndex];

      await this.sendStepResponse(sock, senderJid, step, session.context);

      if (step.wait) {
        console.log(`⏳ Flow ${flow.name}: Waiting at step ${session.currentStepIndex}`);
        break;
      }

      session.currentStepIndex += 1;
      session.lastInteraction = new Date();
      await session.save();
    }

    if (session.currentStepIndex >= flow.steps.length) {
      console.log(`✅ Flow ${flow.name}: Completed for ${senderJid}`);
      await session.destroy();
    }
  }

  private async sendStepResponse(sock: any, jid: string, step: any, context: any) {
    const rawText = step.message || step.responseText || '';
    const formattedText = WhatsappUtils.replaceVariables(rawText, context);

    let options: any;

    switch (step.type) {
      case 'text':
        options = { text: formattedText };
        break;
      case 'image':
      case 'video':
      case 'audio':
      case 'document':
        options = await WhatsappUtils.prepareMessageOptions(formattedText, step.mediaUrl, step.type);
        break;
      case 'buttons':
        options = {
          text: formattedText,
          footer: step.footer || '',
          buttons: (step.buttons || []).slice(0, 3).map((b: string, i: number) => ({
            buttonId: `btn_${i}`,
            buttonText: { displayText: b },
            type: 1,
          })),
        };
        break;
    }

    if (options) {
      const res = await sock.sendMessage(jid, options);
      const cleanReceiver = jid.replace(/@.*$/, '').replace(/\D/g, '');
      await this.messageLogModel.create({
        sender: 'AutoBot',
        receiver: cleanReceiver,
        message: formattedText,
        status: 'sent',
        messageId: res?.key?.id || `bot_${Date.now()}`,
      });
    }
  }

  private async findMatchingFlow(botPhone: string, text: string): Promise<ChatFlow | null> {
    const flows = await this.chatFlowModel.findAll({
      where: {
        isActive: true,
        [Op.or]: [{ botPhone: botPhone }, { botPhone: null }]
      }
    });

    return flows.find(f => WhatsappUtils.matchKeyword(text, f.triggerKeywords)) || null;
  }

  private async handleFallback(botPhone: string, sock: any, senderJid: string, text: string) {
    const fallbackFlow = await this.chatFlowModel.findOne({
      where: {
        isActive: true,
        [Op.or]: [{ botPhone: botPhone }, { botPhone: null }],
        name: { [Op.iLike]: '%fallback%' }
      }
    });

    if (fallbackFlow) {
      const session = await this.chatSessionModel.create({
        senderJid,
        botPhone,
        currentFlowId: fallbackFlow.id,
        currentStepIndex: 0,
        context: { originalInput: text },
        lastInteraction: new Date()
      });
      await this.executeFlowSteps(sock, fallbackFlow, session);
    }
  }

  private unwrapMessage(msg: any): any {
    let current = msg;
    for (let i = 0; i < 5 && current; i++) {
      const nested = current.ephemeralMessage?.message
        || current.viewOnceMessage?.message
        || current.viewOnceMessageV2?.message
        || current.viewOnceMessageV2Extension?.message
        || current.documentWithCaptionMessage?.message
        || current.editedMessage?.message
        || null;
      if (!nested) break;
      current = nested;
    }
    return current;
  }

  private extractText(msgContent: any): string {
    const text = msgContent.conversation ||
      msgContent.extendedTextMessage?.text ||
      msgContent.imageMessage?.caption ||
      msgContent.videoMessage?.caption ||
      msgContent.buttonsResponseMessage?.selectedDisplayText ||
      msgContent.listResponseMessage?.singleSelectReply?.title ||
      msgContent.templateButtonReplyMessage?.selectedDisplayText ||
      msgContent.templateButtonReplyMessage?.selectedId ||
      msgContent.interactiveResponseMessage?.body?.text ||
      '';
    return text.trim();
  }

  private isGlobalCommand(text: string): boolean {
    const cmd = text.toLowerCase().trim();
    return ['exit', 'stop', 'restart'].includes(cmd);
  }

  private async handleWebhooks(phone: string, sender: string, text: string, msgContent: any, timestamp: any) {
    try {
      const user = await this.userModel.findOne({ where: { number: phone } });
      const admin = await this.userModel.findOne({ where: { userType: 'admin' } });

      const payload = {
        phone,
        sender,
        message: text,
        type: Object.keys(msgContent)[0],
        timestamp,
      };

      if (user?.webhookUrl) axios.post(user.webhookUrl, payload).catch(() => {});
      if (admin?.webhookUrl && admin.number !== phone) {
        axios.post(admin.webhookUrl, { ...payload, userNumber: phone }).catch(() => {});
      }
    } catch (e) {}
  }
}
