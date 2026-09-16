import { Injectable, Logger, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import axios from 'axios';
import { WabaDevice } from '../database/models/WabaDevice';
import { WabaTemplate } from '../database/models/WabaTemplate';
import { WabaCampaign } from '../database/models/WabaCampaign';
import { WabaAutomation } from '../database/models/WabaAutomation';
import { WabaFlow } from '../database/models/WabaFlow';
import { MessageLog } from '../database/models/MessageLog';

@Injectable()
export class WabaService {
  private readonly logger = new Logger(WabaService.name);

  constructor(
    @InjectModel(WabaDevice) private wabaDeviceModel: typeof WabaDevice,
    @InjectModel(WabaTemplate) private wabaTemplateModel: typeof WabaTemplate,
    @InjectModel(WabaCampaign) private wabaCampaignModel: typeof WabaCampaign,
    @InjectModel(WabaAutomation) private wabaAutomationModel: typeof WabaAutomation,
    @InjectModel(WabaFlow) private wabaFlowModel: typeof WabaFlow,
    @InjectModel(MessageLog) private messageLogModel: typeof MessageLog,
  ) {}

  // ---------------- DEVICES ----------------
  async getPublicConfig() {
    const metaAppId = process.env.META_APP_ID || process.env.NEXT_PUBLIC_META_APP_ID || '';
    return { metaAppId };
  }

  async getDevices(userNumber: string) {
    return await this.wabaDeviceModel.findAll({ where: { userNumber } });
  }

  async addDevice(userNumber: string, data: any) {
    return await this.wabaDeviceModel.create({
      userNumber,
      phone: data.phone.replace(/\D/g, ''),
      phoneNumberId: data.phoneNumberId,
      wabaAccountId: data.wabaAccountId,
      accessToken: data.accessToken,
      status: 'active',
      qualityRating: 'GREEN',
    });
  }

  async deleteDevice(userNumber: string, id: number) {
    await this.wabaDeviceModel.destroy({ where: { id, userNumber } });
    return true;
  }

  async handleEmbeddedSignup(userNumber: string, data: any) {
    if (data.phone && data.phoneNumberId && data.wabaAccountId && data.accessToken) {
      return await this.addDevice(userNumber, data);
    }

    if (data.code) {
      try {
        const appId = process.env.META_APP_ID || '';
        const appSecret = process.env.META_APP_SECRET || '';

        const tokenRes = await axios.get(`https://graph.facebook.com/v19.0/oauth/access_token`, {
          params: {
            client_id: appId,
            client_secret: appSecret,
            code: data.code,
          },
        });

        const userAccessToken = tokenRes.data?.access_token;
        if (!userAccessToken) throw new BadRequestException('Failed to obtain access token from Meta');

        const wabaRes = await axios.get(`https://graph.facebook.com/v19.0/me/client_whatsapp_business_accounts`, {
          headers: { Authorization: `Bearer ${userAccessToken}` },
        });

        const wabaAccounts = wabaRes.data?.data || [];
        if (wabaAccounts.length === 0) throw new BadRequestException('No WhatsApp Business Accounts found in Meta account');

        const wabaAccountId = wabaAccounts[0].id;

        const phonesRes = await axios.get(`https://graph.facebook.com/v19.0/${wabaAccountId}/phone_numbers`, {
          headers: { Authorization: `Bearer ${userAccessToken}` },
        });

        const phoneNumbers = phonesRes.data?.data || [];
        if (phoneNumbers.length === 0) throw new BadRequestException('No Phone Numbers found in Meta WABA account');

        const firstPhone = phoneNumbers[0];

        return await this.addDevice(userNumber, {
          phone: firstPhone.display_phone_number || firstPhone.id,
          phoneNumberId: firstPhone.id,
          wabaAccountId: wabaAccountId,
          accessToken: userAccessToken,
        });
      } catch (err: any) {
        this.logger.error('Meta Embedded Signup Error:', err.response?.data || err.message);
        throw new BadRequestException('Meta Embedded Signup failed. Please verify credentials or use manual setup.');
      }
    }

    throw new BadRequestException('Invalid Embedded Signup payload');
  }

  // ---------------- TEMPLATES ----------------
  async getTemplates(userNumber: string) {
    return await this.wabaTemplateModel.findAll({ where: { userNumber } });
  }

  async syncTemplatesFromMeta(userNumber: string, deviceId: number) {
    const device = await this.wabaDeviceModel.findOne({ where: { id: deviceId, userNumber } });
    if (!device) throw new NotFoundException('WABA Device not found');

    try {
      const url = `https://graph.facebook.com/v19.0/${device.wabaAccountId}/message_templates`;
      const response = await axios.get(url, {
        headers: { Authorization: `Bearer ${device.accessToken}` },
      });

      const templates = response.data?.data || [];
      for (const t of templates) {
        await this.wabaTemplateModel.findOrCreate({
          where: { userNumber, name: t.name, language: t.language || 'en_US' },
          defaults: {
            userNumber,
            name: t.name,
            language: t.language || 'en_US',
            category: t.category || 'MARKETING',
            status: t.status || 'APPROVED',
            components: t.components || [],
          },
        });
      }

      return await this.getTemplates(userNumber);
    } catch (err: any) {
      this.logger.error('Meta Template Sync Error:', err.response?.data || err.message);
      throw new BadRequestException('Failed to sync templates from Meta Graph API');
    }
  }

  async createTemplate(userNumber: string, data: any) {
    return await this.wabaTemplateModel.create({
      userNumber,
      name: data.name.toLowerCase().replace(/\s+/g, '_'),
      language: data.language || 'en_US',
      category: data.category || 'MARKETING',
      status: 'APPROVED',
      components: data.components || [{ type: 'BODY', text: data.messageBody || '' }],
    });
  }

  // ---------------- MESSAGING (META CLOUD API) ----------------
  async sendSingleMessage(userNumber: string, data: { deviceId?: number; to: string; text: string }) {
    const device = data.deviceId
      ? await this.wabaDeviceModel.findOne({ where: { id: data.deviceId, userNumber } })
      : await this.wabaDeviceModel.findOne({ where: { userNumber, status: 'active' } });

    if (!device) throw new NotFoundException('No active WABA Device found for this user');

    const cleanTo = data.to.replace(/\D/g, '');
    const url = `https://graph.facebook.com/v19.0/${device.phoneNumberId}/messages`;

    try {
      const response = await axios.post(
        url,
        {
          messaging_product: 'whatsapp',
          recipient_type: 'individual',
          to: cleanTo,
          type: 'text',
          text: { preview_url: true, body: data.text },
        },
        {
          headers: {
            Authorization: `Bearer ${device.accessToken}`,
            'Content-Type': 'application/json',
          },
        },
      );

      const msgId = response.data?.messages?.[0]?.id;

      await this.messageLogModel.create({
        sender: device.phone,
        receiver: cleanTo,
        message: data.text,
        status: 'sent',
        messageId: msgId,
      });

      return response.data;
    } catch (err: any) {
      this.logger.error('Meta Send Message Error:', err.response?.data || err.message);
      throw new BadRequestException(err.response?.data?.error?.message || 'Meta Cloud API message send failed');
    }
  }

  async sendDynamicMessage(userNumber: string, data: { deviceId?: number; to: string; templateName: string; language?: string; parameters: string[] }) {
    const device = data.deviceId
      ? await this.wabaDeviceModel.findOne({ where: { id: data.deviceId, userNumber } })
      : await this.wabaDeviceModel.findOne({ where: { userNumber, status: 'active' } });

    if (!device) throw new NotFoundException('No active WABA Device found');

    const cleanTo = data.to.replace(/\D/g, '');
    const url = `https://graph.facebook.com/v19.0/${device.phoneNumberId}/messages`;

    const bodyParameters = (data.parameters || []).map((param) => ({
      type: 'text',
      text: param,
    }));

    try {
      const response = await axios.post(
        url,
        {
          messaging_product: 'whatsapp',
          recipient_type: 'individual',
          to: cleanTo,
          type: 'template',
          template: {
            name: data.templateName,
            language: { code: data.language || 'en_US' },
            components: [
              {
                type: 'body',
                parameters: bodyParameters,
              },
            ],
          },
        },
        {
          headers: {
            Authorization: `Bearer ${device.accessToken}`,
            'Content-Type': 'application/json',
          },
        },
      );

      await this.messageLogModel.create({
        sender: device.phone,
        receiver: cleanTo,
        message: `Template: ${data.templateName} (${data.parameters.join(', ')})`,
        status: 'sent',
        messageId: response.data?.messages?.[0]?.id,
      });

      return response.data;
    } catch (err: any) {
      this.logger.error('Meta Dynamic Message Error:', err.response?.data || err.message);
      throw new BadRequestException(err.response?.data?.error?.message || 'Meta Cloud API template send failed');
    }
  }

  async sendBulkMessages(userNumber: string, data: { deviceId?: number; numbers: string[]; templateName: string; language?: string; parameters?: string[] }) {
    const results = [];
    for (const num of data.numbers) {
      try {
        const res = await this.sendDynamicMessage(userNumber, {
          deviceId: data.deviceId,
          to: num,
          templateName: data.templateName,
          language: data.language,
          parameters: data.parameters || [],
        });
        results.push({ phone: num, status: 'sent', result: res });
      } catch (err: any) {
        results.push({ phone: num, status: 'failed', error: err.message });
      }
    }
    return results;
  }

  // ---------------- AUTOMATION ----------------
  async getAutomations(userNumber: string) {
    return await this.wabaAutomationModel.findAll({ where: { userNumber } });
  }

  async createAutomation(userNumber: string, data: any) {
    return await this.wabaAutomationModel.create({
      userNumber,
      triggerKeyword: data.triggerKeyword.toLowerCase().trim(),
      responseType: data.responseType || 'text',
      messageText: data.messageText || '',
      templateName: data.templateName || null,
      isActive: true,
    });
  }

  async deleteAutomation(userNumber: string, id: number) {
    await this.wabaAutomationModel.destroy({ where: { id, userNumber } });
    return true;
  }

  // ---------------- CAMPAIGNS ----------------
  async getCampaigns(userNumber: string) {
    return await this.wabaCampaignModel.findAll({ where: { userNumber }, order: [['createdAt', 'DESC']] });
  }

  async createCampaign(userNumber: string, data: any) {
    const scheduledTime = typeof data.scheduledTime === 'number'
      ? data.scheduledTime
      : new Date(data.scheduledTime).getTime();

    return await this.wabaCampaignModel.create({
      userNumber,
      name: data.name,
      templateName: data.templateName,
      numbers: data.numbers || [],
      scheduledTime,
      status: 'pending',
    });
  }

  async deleteCampaign(userNumber: string, id: number) {
    await this.wabaCampaignModel.destroy({ where: { id, userNumber } });
    return true;
  }

  // ---------------- FLOW BUILDER ----------------
  async getFlows(userNumber: string) {
    return await this.wabaFlowModel.findAll({ where: { userNumber } });
  }

  async createFlow(userNumber: string, data: any) {
    return await this.wabaFlowModel.create({
      userNumber,
      name: data.name,
      triggerKeyword: data.triggerKeyword.toLowerCase().trim(),
      flowData: data.flowData || { steps: [] },
      isActive: true,
    });
  }

  async deleteFlow(userNumber: string, id: number) {
    await this.wabaFlowModel.destroy({ where: { id, userNumber } });
    return true;
  }
}
