import { Injectable, OnModuleInit } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import makeWASocket, {
  DisconnectReason,
  fetchLatestBaileysVersion,
  Browsers,
  WAVersion,
  jidNormalizedUser,
} from '@whiskeysockets/baileys';
import { Session } from '../database/models/Session';
import { MessageLog } from '../database/models/MessageLog';
import { ContactName } from '../database/models/ContactName';
import { PostgresAuthService } from './postgres-auth.service';
import { IncomingMessageHandler } from './incoming-message-handler.service';
import { WhatsappUtils } from './whatsapp-utils';

import { join } from 'path';
import * as fs from 'fs';
import pino from 'pino';
import { proto } from '@whiskeysockets/baileys';
import { Op } from 'sequelize';

@Injectable()
export class WhatsappService implements OnModuleInit {
  public sessions = new Map<string, any>();
  public sessionStatus = new Map<string, any>();
  public contactsMap = new Map<string, string>();
  private initializing = new Map<string, Promise<any>>();
  private loggingOut = new Set<string>();
  private sessionOwners = new Map<string, string>();
  private lidToPhone = new Map<string, string>();
  private nameSyncStarted = new Set<string>();
  private mediaSyncStarted = new Set<string>();
  private lastMediaPhone = '';
  private pendingNameLookups = new Map<string, string>();

  public phoneFromJid(value: string): string {
    const jid = String(value || '');
    if (!jid || jid.endsWith('@lid') || jid.endsWith('@g.us') || jid.endsWith('@broadcast')) return '';
    const user = jid.replace(/@.*$/, '').split(':')[0];
    const digits = user.replace(/\D/g, '');
    if (digits.length < 10 || digits.length > 15) return '';
    return digits;
  }

  public registerContactName(phoneOrJid: string, rawName: string, accountPhone?: string) {
    const cleanPhone = this.phoneFromJid(phoneOrJid);
    const cleanName = String(rawName || '').trim();
    if (!cleanPhone || !cleanName || cleanName.startsWith('+') || /^\d+$/.test(cleanName)) return;

    const account = accountPhone ? this.phoneFromJid(accountPhone) || accountPhone.replace(/\D/g, '') : '';
    if (account) this.contactsMap.set(`${account}:${cleanPhone}`, cleanName);
    this.contactsMap.set(cleanPhone, cleanName);

    if (account) {
      this.contactNameModel.upsert({ accountPhone: account, phone: cleanPhone, name: cleanName }).catch((err: any) => {
        console.error(`Contact name save failed for ${cleanPhone}:`, err?.message || err);
      });
    }
  }

  public rememberContact(accountPhone: string, contact: any) {
    if (!contact) return false;
    const name = contact.name || contact.notify || contact.verifiedName || contact.short || contact.pushname || contact.pushName;
    if (!name) return false;

    const phone = this.phoneFromJid(contact.jid || '')
      || this.phoneFromJid(contact.phoneNumber || '')
      || this.phoneFromJid(contact.id || '');
    const lid = String(contact.lid || (String(contact.id || '').endsWith('@lid') ? contact.id : ''))
      .replace(/@.*$/, '')
      .split(':')[0]
      .replace(/\D/g, '');
    const account = String(accountPhone || '').replace(/\D/g, '');

    if (lid && phone) this.lidToPhone.set(`${account}:${lid}`, phone);
    if (lid) this.contactsMap.set(`${account}:lid:${lid}`, String(name).trim());
    if (lid && !phone) {
      const mapped = this.lidToPhone.get(`${account}:${lid}`);
      if (mapped) this.registerContactName(mapped, name, accountPhone);
    }
    if (phone) {
      this.registerContactName(phone, name, accountPhone);
      return true;
    }
    return false;
  }

  public rememberChat(accountPhone: string, chat: any) {
    if (!chat?.name && !chat?.displayName) return false;
    const phone = this.phoneFromJid(chat.id || '')
      || this.phoneFromJid(chat.newJid || '')
      || this.phoneFromJid(chat.oldJid || '')
      || this.phoneFromJid(chat.pnJid || '');
    const lid = String(chat.lid || (String(chat.id || '').endsWith('@lid') ? chat.id : ''))
      .replace(/@.*$/, '')
      .split(':')[0]
      .replace(/\D/g, '');
    const account = String(accountPhone || '').replace(/\D/g, '');
    if (lid && phone) this.lidToPhone.set(`${account}:${lid}`, phone);
    const displayName = chat.name || chat.displayName;
    if (phone && displayName) {
      this.registerContactName(phone, displayName, accountPhone);
      return true;
    }

    if (lid) {
      const mapped = this.lidToPhone.get(`${account}:${lid}`);
      if (mapped && displayName) {
        this.registerContactName(mapped, displayName, accountPhone);
        return true;
      }
    }
    return false;
  }

  private stampPhoneJid(accountPhone: string, msg: any, fallbackPhone?: string) {
    if (!msg?.key) return '';
    const phone = this.phoneFromJid(msg.key.remoteJid || '')
      || this.resolvePhone(accountPhone, msg.key.remoteJid || '')
      || this.phoneFromJid(msg.key.senderPn || '')
      || this.phoneFromJid(msg.key.participantPn || '')
      || this.phoneFromJid(msg.key.remoteJidAlt || '')
      || this.pendingNameLookups.get(msg.key.id)
      || (fallbackPhone ? this.phoneFromJid(fallbackPhone) : '');
    if (phone && !this.phoneFromJid(msg.key.remoteJid || '')) {
      msg.key.remoteJid = `${phone}@s.whatsapp.net`;
    }
    return phone;
  }

  async requestChatMedia(accountPhone: string, otherPhone: string) {
    const account = String(accountPhone || '').replace(/\D/g, '');
    const other = String(otherPhone || '').replace(/\D/g, '');
    const key = `${account}:${other}`;
    if (!account || !other || this.mediaSyncStarted.has(key)) return;
    const sock = this.sessions.get(account);
    if (!sock?.fetchMessageHistory) return;
    this.mediaSyncStarted.add(key);

    const incoming = await this.messageLogModel.findOne({
      where: { sender: other, receiver: account, messageId: { [Op.ne]: null } },
      order: [['createdAt', 'DESC']],
    });
    const log = incoming || await this.messageLogModel.findOne({
      where: { sender: account, receiver: other, messageId: { [Op.ne]: null } },
      order: [['createdAt', 'DESC']],
    });
    if (!log?.messageId) {
      this.mediaSyncStarted.delete(key);
      return;
    }

    const rawTime = Number(log.timestamp || 0);
    const oldestMs = rawTime > 100000000000 ? rawTime : rawTime * 1000;
    try {
      const requestId = await sock.fetchMessageHistory(
        80,
        {
          remoteJid: `${other}@s.whatsapp.net`,
          fromMe: log.sender === account,
          id: log.messageId,
        },
        oldestMs || new Date(log.createdAt).getTime(),
      );
      this.pendingNameLookups.set(log.messageId, other);
      if (requestId) this.pendingNameLookups.set(String(requestId), other);
      this.lastMediaPhone = other;
      console.log(`📎 Asked WhatsApp for media in chat ${other}`);
    } catch (err: any) {
      this.mediaSyncStarted.delete(key);
      console.error(`Media request failed for ${other}:`, err?.message || err);
    }
  }

  private resolvePhone(accountPhone: string, jid: string): string {
    const direct = this.phoneFromJid(jid);
    if (direct) return direct;
    const lid = String(jid || '').replace(/@.*$/, '').split(':')[0].replace(/\D/g, '');
    const account = String(accountPhone || '').replace(/\D/g, '');
    if (!lid) return '';
    return this.lidToPhone.get(`${account}:${lid}`) || '';
  }

  private async requestContactNames(cleanPhone: string, sock: any) {
    if (this.nameSyncStarted.has(cleanPhone)) return;
    if (!sock?.user?.id || this.sessions.get(cleanPhone) !== sock) return;
    this.nameSyncStarted.add(cleanPhone);

    const meJid = jidNormalizedUser(sock.user.id);
    const requestedKeys = new Set<string>(['AAAAAJR3', 'AAAAAJR4']);

    const askForKeys = async (ids: string[]) => {
      if (!ids.length || !sock.relayMessage) return;
      await sock.relayMessage(
        meJid,
        {
          protocolMessage: {
            type: proto.Message.ProtocolMessage.Type.APP_STATE_SYNC_KEY_REQUEST,
            appStateSyncKeyRequest: {
              keyIds: ids.map((id) => ({ keyId: Buffer.from(id, 'base64') })),
            },
          },
        },
        { additionalAttributes: { category: 'peer', push_priority: 'high_force' } },
      );
      console.log(`🔑 Asked the phone for contact-list keys: ${ids.join(', ')}`);
    };

    try {
      await askForKeys([...requestedKeys]);
    } catch (err: any) {
      console.error('Contact key request failed:', err?.message || err);
    }

    try {
      await sock.sendPeerDataOperationMessage({
        fullHistorySyncOnDemandRequest: {
          requestMetadata: { requestId: `names-${Date.now()}` },
          historySyncConfig: {
            fullSyncDaysLimit: 3650,
            fullSyncSizeMbLimit: 1024,
            storageQuotaMb: 10240,
            inlineInitialPayloadInE2EeMsg: true,
            recentSyncDaysLimit: 30,
          },
        },
        peerDataOperationRequestType: proto.Message.PeerDataOperationRequestType.FULL_HISTORY_SYNC_ON_DEMAND,
      });
      console.log(`📜 Asked the phone to resend chats so names can be saved`);
    } catch (err: any) {
      console.error('Chat history request failed:', err?.message || err);
    }

    const collections = ['critical_block', 'critical_unblock_low', 'regular_high', 'regular', 'regular_low'];
    for (let attempt = 1; attempt <= 8; attempt++) {
      await new Promise((resolve) => setTimeout(resolve, 8000));
      if (this.sessions.get(cleanPhone) !== sock) return;
      try { sock.ev.flush(); } catch {}

      const stored = await this.contactNameModel.count({ where: { accountPhone: cleanPhone } });
      if (stored > 0) {
        console.log(`👤 Contact names stored for ${cleanPhone}: ${stored}`);
        break;
      }

      const keyCount = await this.sessionModel.count({
        where: { phone: cleanPhone, dataType: 'app-state-sync-key' },
      });
      if (!keyCount) {
        console.log(`🔑 Waiting for contact-list keys (${attempt}/8)`);
        continue;
      }

      try {
        await sock.resyncAppState(collections, false);
      } catch (err: any) {
        const message = String(err?.message || err);
        console.error('Address book read failed:', message);
        const match = message.match(/failed to find key "([^"]+)"/);
        if (match && !requestedKeys.has(match[1])) {
          requestedKeys.add(match[1]);
          await askForKeys([match[1]]).catch(() => {});
        }
      } finally {
        try { sock.ev.flush(); } catch {}
      }

      const ready = await this.contactNameModel.count({ where: { accountPhone: cleanPhone } });
      console.log(`📒 Address book read for ${cleanPhone}. Names stored: ${ready}`);
      if (ready > 0) break;
    }

  }

  public contactDisplayName(accountPhone: string, phone: string) {
    const account = (accountPhone || '').replace(/\D/g, '');
    const clean = (phone || '').replace(/\D/g, '');
    return this.contactsMap.get(`${account}:${clean}`) || null;
  }

  constructor(
    @InjectModel(Session)
    private sessionModel: typeof Session,
    @InjectModel(MessageLog)
    private messageLogModel: typeof MessageLog,
    @InjectModel(ContactName)
    private contactNameModel: typeof ContactName,
    private postgresAuthService: PostgresAuthService,
    private incomingMessageHandler: IncomingMessageHandler,
  ) {}

  async onModuleInit() {
    // Restore active sessions on startup
    const activeSessions = await this.sessionModel.findAll({
      where: { dataType: 'creds', dataId: 'base' },
    });

    for (const session of activeSessions) {
      console.log(`🔄 Restoring session: ${session.phone}`);
      this.initWhatsApp(session.phone, session.userNumber || undefined).catch(() => {});
    }
  }

  private rememberOwner(cleanPhone: string, ownerUserNumber?: string) {
    const cleanOwner = ownerUserNumber ? ownerUserNumber.replace(/\D/g, '') : '';
    if (cleanOwner) this.sessionOwners.set(cleanPhone, cleanOwner);
    return this.sessionOwners.get(cleanPhone);
  }

  private patchStatus(cleanPhone: string, patch: Record<string, any>) {
    const prev = this.sessionStatus.get(cleanPhone) || {};
    const ownerUserNumber = this.sessionOwners.get(cleanPhone) || prev.ownerUserNumber;
    this.sessionStatus.set(cleanPhone, { ...prev, ...patch, ownerUserNumber });
  }

  async initWhatsApp(phone: string, ownerUserNumber?: string): Promise<any> {
    const cleanPhone = phone.replace(/\D/g, '');

    // Guard against multiple initializations
    if (this.initializing.has(cleanPhone)) return this.initializing.get(cleanPhone);

    // If already connected, return the existing session
    if (this.sessions.has(cleanPhone)) {
        const currentStatus = this.getStatus(cleanPhone).status;
        if (currentStatus === 'connected' || currentStatus === 'connecting' || currentStatus === 'pairing') {
            return this.sessions.get(cleanPhone);
        }
    }

    const owner = this.rememberOwner(cleanPhone, ownerUserNumber);

    const promise = (async () => {
      try {
        // Force cleanup of old session if it exists
        const oldSock = this.sessions.get(cleanPhone);
        if (oldSock) {
          try {
            oldSock.ev.removeAllListeners();
            if (oldSock.ws) oldSock.ws.close();
          } catch (e) {}
          this.sessions.delete(cleanPhone);
        }

        console.log(`🔌 Initializing WhatsApp session: ${cleanPhone}`);
        const { state, saveCreds } = await this.postgresAuthService.getAuthState(cleanPhone, owner);
        console.log(`🔑 Auth State loaded for: ${cleanPhone}`);

        // Get version with a faster fallback and retry
        const { version } = (await fetchLatestBaileysVersion().catch(() => ({
          version: [2, 3000, 1015901307],
        }))) as { version: WAVersion };

        console.log(`📦 WhatsApp Version: ${version.join('.')} for ${cleanPhone}`);

        const sock = makeWASocket({
          version,
          auth: state,
          logger: pino({ level: 'silent' }),
          printQRInTerminal: false,
          browser: Browsers.ubuntu('Chrome'),
          syncFullHistory: true,
          shouldSyncHistoryMessage: () => true,
          connectTimeoutMs: 60000,
          defaultQueryTimeoutMs: 0,
          keepAliveIntervalMs: 30000,
          generateHighQualityLinkPreview: true,
          retryRequestDelayMs: 5000,
          markOnlineOnConnect: true,
          // Enhanced retry logic for LID/PN decryption issues
          maxMsgRetryCount: 5,
          getMessage: async (key) => {
            try {
              if (this.messageLogModel) {
                const msg = await this.messageLogModel.findOne({
                  where: { messageId: key.id }
                });
                if (msg) return { conversation: msg.message };
              }
              return { conversation: 'Message will be delivered shortly...' };
            } catch (e) {
              return { conversation: 'Processing message...' };
            }
          },
          patchMessageBeforeSending: (message) => {
             const requiresPatch = !!(
               message.buttonsMessage ||
               message.templateMessage ||
               message.listMessage
             );
             if (requiresPatch) {
               return {
                 viewOnceMessage: {
                   message: {
                     messageContextInfo: {
                       deviceListMetadata: {},
                       deviceListMetadataVersion: 2,
                     },
                     ...message,
                   },
                 },
               };
             }
             return message;
          },
        });

        this.sessions.set(cleanPhone, sock);
        this.patchStatus(cleanPhone, { status: 'connecting' });

        sock.ev.on('creds.update', async (update) => {
          Object.assign(state.creds, update);
          await saveCreds();
        });

        sock.ev.on('connection.update', async ({ connection, lastDisconnect, qr }) => {
          if (qr) {
            this.patchStatus(cleanPhone, { qr, status: 'pairing' });
            console.log(`📸 New QR Code generated for: ${cleanPhone}`);
          }

          if (connection === 'open') {
            this.patchStatus(cleanPhone, { status: 'connected', qr: null, pairingCode: null });
            console.log(`✅ WhatsApp Connected: ${cleanPhone}`);
            setTimeout(() => {
              this.requestContactNames(cleanPhone, sock).catch((err) => {
                console.error(`Contact name sync failed for ${cleanPhone}:`, err?.message || err);
              });
            }, 25000);
          }

          if (connection === 'close') {
            const reason = (lastDisconnect?.error as any)?.output?.statusCode;
            console.log(`❌ Connection closed for ${cleanPhone}. Reason: ${reason}`);

            this.sessions.delete(cleanPhone);
            this.nameSyncStarted.delete(cleanPhone);

            const isLoggedOut = reason === DisconnectReason.loggedOut || reason === 401 || this.loggingOut.has(cleanPhone);

            if (isLoggedOut) {
              console.log(`🔒 Session logged out / unlinked for ${cleanPhone}. Cleaning up session data.`);
              this.sessionStatus.delete(cleanPhone);
              this.sessionOwners.delete(cleanPhone);
              this.nameSyncStarted.delete(cleanPhone);
              this.sessionModel.destroy({ where: { phone: cleanPhone } }).catch(() => {});
            } else if (reason === 515 || reason === DisconnectReason.restartRequired) {
              console.log(`🔄 Restart required (${reason}) for ${cleanPhone}, reconnecting now...`);
              setTimeout(() => this.initWhatsApp(cleanPhone).catch(() => {}), 1000);
            } else if (reason === DisconnectReason.connectionReplaced || reason === 440) {
              console.log(`⚠️ Connection conflict (440) for ${cleanPhone}: Session opened on another server/instance. Pausing auto-reconnect to prevent conflict loop.`);
              this.patchStatus(cleanPhone, { status: 'disconnected', reason: 'Connection conflict (440)' });
            } else {
              this.patchStatus(cleanPhone, { status: 'disconnected' });
              setTimeout(() => this.initWhatsApp(cleanPhone), 5000);
            }
          }
        });

        const saveContacts = (contacts: any[], label: string) => {
          let saved = 0;
          for (const contact of contacts || []) {
            if (this.rememberContact(cleanPhone, contact)) saved++;
          }
          if (saved) console.log(`👤 Saved ${saved} ${label} names for ${cleanPhone}`);
        };

        sock.ev.on('contacts.upsert', (contacts: any[]) => saveContacts(contacts, 'contact'));
        sock.ev.on('contacts.update', (updates: any[]) => saveContacts(updates, 'contact'));
        sock.ev.on('chats.upsert', (chats: any[]) => {
          let saved = 0;
          for (const chat of chats || []) if (this.rememberChat(cleanPhone, chat)) saved++;
          if (saved) console.log(`👤 Saved ${saved} chat names for ${cleanPhone}`);
        });
        sock.ev.on('chats.update', (chats: any[]) => {
          for (const chat of chats || []) this.rememberChat(cleanPhone, chat);
        });
        sock.ev.on('chats.phoneNumberShare', ({ lid, jid }: { lid: string; jid: string }) => {
          const phone = this.phoneFromJid(jid);
          const lidDigits = String(lid || '').replace(/@.*$/, '').split(':')[0].replace(/\D/g, '');
          if (!phone || !lidDigits) return;
          this.lidToPhone.set(`${cleanPhone}:${lidDigits}`, phone);
          const lidName = this.contactsMap.get(`${cleanPhone}:lid:${lidDigits}`);
          if (lidName) this.registerContactName(phone, lidName, cleanPhone);
        });

        sock.ev.on('messages.upsert', (m) => {
          for (const msg of m.messages || []) this.stampPhoneJid(cleanPhone, msg);
          this.incomingMessageHandler.handle(cleanPhone, sock, m);
        });

        const saveHistory = async (history: any, label: string) => {
          const sample = history.chats?.[0];
          const sampleMsg = history.messages?.[0];
          console.log(
            `📜 History Sync (${label}) for ${cleanPhone}: ${history.messages?.length || 0} messages, ${history.contacts?.length || 0} contacts, ${history.chats?.length || 0} chats`,
          );
          if (sample) {
            console.log(`📜 Sample chat id=${sample.id} name=${sample.name || sample.displayName || ''} pn=${sample.pnJid || ''}`);
          }
          if (sampleMsg) {
            console.log(`📜 Sample message push=${sampleMsg.pushName || ''} jid=${sampleMsg.key?.remoteJid || ''} pn=${sampleMsg.key?.senderPn || sampleMsg.key?.participantPn || ''} keys=${Object.keys(sampleMsg.message || {}).join(',')}`);
          }
          const requestedPhone = this.pendingNameLookups.get(history.peerDataRequestSessionId)
            || history.messages?.map((msg: any) => this.pendingNameLookups.get(msg.key?.id)).find(Boolean)
            || ((history.chats?.length || 0) <= 1 ? this.lastMediaPhone : '');
          const historyName = sample?.name || sample?.displayName
            || history.contacts?.find((contact: any) => contact?.name || contact?.notify)?.name
            || history.contacts?.find((contact: any) => contact?.notify)?.notify
            || history.messages?.find((msg: any) => !msg.key?.fromMe && msg.pushName)?.pushName;
          if (requestedPhone && historyName) {
            this.registerContactName(requestedPhone, historyName, cleanPhone);
          }
          if (history.chats && history.chats.length > 0) {
            for (const chat of history.chats) this.rememberChat(cleanPhone, chat);
          }
          if (history.contacts && history.contacts.length > 0) {
            for (const c of history.contacts) this.rememberContact(cleanPhone, c);
          }
          if (history.messages && history.messages.length > 0) {
            for (const msg of history.messages) {
              const fallback = this.pendingNameLookups.get(msg.key?.id) || requestedPhone;
              const phone = this.stampPhoneJid(cleanPhone, msg, fallback);
              const kind = msg.message?.imageMessage ? 'image'
                : msg.message?.videoMessage ? 'video'
                : msg.message?.audioMessage ? 'audio'
                : msg.message?.documentMessage ? 'document'
                : '';
              if (kind) console.log(`📎 History ${kind} ${msg.key?.id} -> ${phone || 'no phone'}`);
              if (!msg.key?.fromMe && msg.pushName && phone) {
                this.registerContactName(phone, msg.pushName, cleanPhone);
              }
              await this.incomingMessageHandler.saveHistoryMessage(cleanPhone, msg, sock);
            }
          }
          const ready = await this.contactNameModel.count({ where: { accountPhone: cleanPhone } });
          console.log(`👤 Contact names stored for ${cleanPhone}: ${ready}`);
        };

        (sock.ev as any).on('messaging-history.set', (history: any) => saveHistory(history, 'set'));
        (sock.ev as any).on('messaging-history.sync', (history: any) => saveHistory(history, 'sync'));

        return sock;
      } catch (err) {
        console.error(`💥 Failed to init WhatsApp for ${cleanPhone}:`, err.message);
        this.sessionStatus.delete(cleanPhone);
        throw err;
      } finally {
        this.initializing.delete(cleanPhone);
      }
    })();

    this.initializing.set(cleanPhone, promise);
    return promise;
  }

  async forceLogout(phone: string) {
    const cleanPhone = phone.replace(/\D/g, '');
    this.loggingOut.add(cleanPhone);
    const sock = this.sessions.get(cleanPhone);

    if (sock) {
      try {
        console.log(`🚪 Sending logout signal to WhatsApp servers for: ${cleanPhone}`);
        if (sock.ws?.readyState === 1 || sock.user) {
          await sock.logout('User initiated disconnect').catch((err: any) => {
            console.log(`⚠️ Socket logout error (ignoring): ${err?.message || err}`);
          });
        }
      } catch (e) {}

      try {
        sock.ev.removeAllListeners();
        if (sock.ws) sock.ws.close();
      } catch (e) {}

      this.sessions.delete(cleanPhone);
    }

    this.sessionStatus.delete(cleanPhone);
    this.sessionOwners.delete(cleanPhone);

    // Completely purge session credentials & auth state from database
    await this.sessionModel.destroy({ where: { phone: cleanPhone } });
    console.log(`🗑️ Auth state purged from database for: ${cleanPhone}`);

    setTimeout(() => this.loggingOut.delete(cleanPhone), 2000);
  }

  getStatus(phone: string) {
    const cleanPhone = phone.replace(/\D/g, '');
    return this.sessionStatus.get(cleanPhone) || { status: 'not_connected' };
  }

  async broadcast(sender: string, numbers: string[], message: string, messageLogModel: any, statModel: any, mediaUrl?: string, mediaType?: string) {
    const sock = this.sessions.get(sender);
    if (!sock || this.getStatus(sender).status !== 'connected') {
      throw new Error(`WhatsApp (${sender}) is disconnected.`);
    }

    const results = [];
    for (const num of numbers) {
      try {
        const jid = num.replace(/\D/g, '') + '@s.whatsapp.net';

        const messageOptions = await WhatsappUtils.prepareMessageOptions(message, mediaUrl, mediaType);

        if (!messageOptions) {
          results.push({ number: num, status: 'failed', error: 'Empty message' });
          continue;
        }

        const result = await sock.sendMessage(jid, messageOptions);

        await messageLogModel.create({
          sender,
          receiver: num,
          message,
          status: 'sent',
          mediaUrl,
          mediaType,
          messageId: result?.key?.id
        });
        const [stat] = await statModel.findOrCreate({ where: { id: 1 }, defaults: { totalMessagesSent: 0 } });
        await stat.increment('totalMessagesSent');

        results.push({ number: num, status: 'sent' });
        await new Promise(r => setTimeout(r, 1000 + Math.random() * 1000)); // Throttling
      } catch (e) {
        results.push({ number: num, status: 'failed', error: e.message });
      }
    }
    return results;
  }
}
