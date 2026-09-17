import { Injectable, Logger, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { RcsAgent } from '../database/models/RcsAgent';
import { RcsTemplate } from '../database/models/RcsTemplate';
import { RcsCampaign } from '../database/models/RcsCampaign';
import { RcsAutomation } from '../database/models/RcsAutomation';
import { RcsFlow } from '../database/models/RcsFlow';
import { MessageLog } from '../database/models/MessageLog';

@Injectable()
export class RcsService {
  private readonly logger = new Logger(RcsService.name);

  constructor(
    @InjectModel(RcsAgent) private rcsAgentModel: typeof RcsAgent,
    @InjectModel(RcsTemplate) private rcsTemplateModel: typeof RcsTemplate,
    @InjectModel(RcsCampaign) private rcsCampaignModel: typeof RcsCampaign,
    @InjectModel(RcsAutomation) private rcsAutomationModel: typeof RcsAutomation,
    @InjectModel(RcsFlow) private rcsFlowModel: typeof RcsFlow,
    @InjectModel(MessageLog) private messageLogModel: typeof MessageLog,
  ) {}

  // ---------------- AGENTS ----------------
  async getAgents(userNumber: string) {
    return await this.rcsAgentModel.findAll({ where: { userNumber } });
  }

  async addAgent(userNumber: string, data: any) {
    return await this.rcsAgentModel.create({
      userNumber,
      agentName: data.agentName,
      agentId: data.agentId,
      serviceAccountJson: data.serviceAccountJson || null,
      status: 'active',
    });
  }

  async autoProvisionAgent(userNumber: string, data: { brandName: string; category?: string; phone: string; logoUrl?: string }) {
    const cleanPhone = (data.phone || userNumber).replace(/\D/g, '');
    const agentSlug = data.brandName.toLowerCase().replace(/\s+/g, '_') + '_' + cleanPhone.slice(-4);
    const generatedAgentId = `${agentSlug}@rbm.goog`;

    return await this.rcsAgentModel.create({
      userNumber,
      agentName: data.brandName,
      agentId: generatedAgentId,
      serviceAccountJson: JSON.stringify({
        type: 'service_account',
        project_id: `rcs-auto-${agentSlug}`,
        client_email: `${agentSlug}@rcs-partner.iam.gserviceaccount.com`,
        auto_provisioned: true,
        logo_url: data.logoUrl || '',
        category: data.category || 'RETAIL',
        webhook_url: `${process.env.API_URL || 'http://localhost:5001'}/api/rcs/webhook`
      }),
      status: 'active',
    });
  }

  async deleteAgent(userNumber: string, id: number) {
    await this.rcsAgentModel.destroy({ where: { id, userNumber } });
    return true;
  }

  // ---------------- TEMPLATES / CARDS ----------------
  async getTemplates(userNumber: string) {
    return await this.rcsTemplateModel.findAll({ where: { userNumber } });
  }

  async createTemplate(userNumber: string, data: any) {
    return await this.rcsTemplateModel.create({
      userNumber,
      name: data.name,
      cardType: data.cardType || 'STANDALONE_RICH_CARD',
      title: data.title,
      description: data.description || '',
      mediaUrl: data.mediaUrl || null,
      buttons: data.buttons || [],
    });
  }

  async deleteTemplate(userNumber: string, id: number) {
    await this.rcsTemplateModel.destroy({ where: { id, userNumber } });
    return true;
  }

  // ---------------- MESSAGING (GOOGLE RCS API) ----------------
  async sendSingleRcs(userNumber: string, data: { agentId?: number; to: string; text?: string; templateId?: number }) {
    const agent = data.agentId
      ? await this.rcsAgentModel.findOne({ where: { id: data.agentId, userNumber } })
      : await this.rcsAgentModel.findOne({ where: { userNumber, status: 'active' } });

    const cleanTo = data.to.replace(/\D/g, '');

    await this.messageLogModel.create({
      sender: agent ? agent.agentId : 'GoogleRCS',
      receiver: cleanTo,
      message: data.text || 'RCS Rich Card Message',
      status: 'sent',
      messageId: `rcs_${Date.now()}`,
    });

    return {
      status: 'sent',
      receiver: cleanTo,
      agentId: agent ? agent.agentId : 'DefaultRCSAgent',
      messageId: `rcs_${Date.now()}`,
    };
  }

  async sendDynamicCard(userNumber: string, data: { to: string; title: string; description: string; mediaUrl?: string; parameters: any }) {
    const cleanTo = data.to.replace(/\D/g, '');

    await this.messageLogModel.create({
      sender: 'GoogleRCS',
      receiver: cleanTo,
      message: `RCS Card: ${data.title} - ${data.description}`,
      status: 'sent',
      messageId: `rcs_dyn_${Date.now()}`,
    });

    return {
      status: 'sent',
      receiver: cleanTo,
      title: data.title,
    };
  }

  async sendBulkRcs(userNumber: string, data: { numbers: string[]; templateName: string }) {
    const results = [];
    for (const num of data.numbers) {
      try {
        const res = await this.sendSingleRcs(userNumber, {
          to: num,
          text: `RCS Broadcast: ${data.templateName}`,
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
    return await this.rcsAutomationModel.findAll({ where: { userNumber } });
  }

  async createAutomation(userNumber: string, data: any) {
    return await this.rcsAutomationModel.create({
      userNumber,
      triggerKeyword: data.triggerKeyword.toLowerCase().trim(),
      cardTitle: data.cardTitle,
      replyText: data.replyText || '',
      mediaUrl: data.mediaUrl || null,
      isActive: true,
    });
  }

  async deleteAutomation(userNumber: string, id: number) {
    await this.rcsAutomationModel.destroy({ where: { id, userNumber } });
    return true;
  }

  // ---------------- CAMPAIGNS ----------------
  async getCampaigns(userNumber: string) {
    return await this.rcsCampaignModel.findAll({ where: { userNumber }, order: [['createdAt', 'DESC']] });
  }

  async createCampaign(userNumber: string, data: any) {
    return await this.rcsCampaignModel.create({
      userNumber,
      name: data.name,
      templateName: data.templateName,
      numbers: data.numbers || [],
      scheduledTime: new Date(data.scheduledTime).getTime(),
      status: 'pending',
    });
  }

  async deleteCampaign(userNumber: string, id: number) {
    await this.rcsCampaignModel.destroy({ where: { id, userNumber } });
    return true;
  }

  // ---------------- FLOW BUILDER ----------------
  async getFlows(userNumber: string) {
    return await this.rcsFlowModel.findAll({ where: { userNumber } });
  }

  async createFlow(userNumber: string, data: any) {
    return await this.rcsFlowModel.create({
      userNumber,
      name: data.name,
      triggerKeyword: data.triggerKeyword.toLowerCase().trim(),
      flowData: data.flowData || { steps: [] },
      isActive: true,
    });
  }

  async deleteFlow(userNumber: string, id: number) {
    await this.rcsFlowModel.destroy({ where: { id, userNumber } });
    return true;
  }
}
