import { Controller, Get, Post, Delete, Body, Param, Query, UseGuards, Req } from '@nestjs/common';
import { WabaService } from './waba.service';
import { TokenAuthGuard } from '../auth/guards/token-auth.guard';

@Controller('waba')
@UseGuards(TokenAuthGuard)
export class WabaController {
  constructor(private wabaService: WabaService) {}

  // ---------------- DEVICES ----------------
  @Get('public-config')
  async getPublicConfig() {
    const result = await this.wabaService.getPublicConfig();
    return { message: 'Public WABA config fetched', result };
  }

  @Get('devices')
  async getDevices(@Req() req: any) {
    const result = await this.wabaService.getDevices(req.userNumber);
    return { message: 'WABA devices fetched', result };
  }

  @Post('devices')
  async addDevice(@Body() body: any, @Req() req: any) {
    const result = await this.wabaService.addDevice(req.userNumber, body);
    return { message: 'WABA device added successfully', result };
  }

  @Post('embedded-signup')
  async handleEmbeddedSignup(@Body() body: any, @Req() req: any) {
    const result = await this.wabaService.handleEmbeddedSignup(req.userNumber, body);
    return { message: 'Meta WABA account linked via Embedded Signup', result };
  }

  @Delete('devices/:id')
  async deleteDevice(@Param('id') id: number, @Req() req: any) {
    await this.wabaService.deleteDevice(req.userNumber, id);
    return { message: 'WABA device deleted' };
  }

  // ---------------- TEMPLATES ----------------
  @Get('templates')
  async getTemplates(@Req() req: any) {
    const result = await this.wabaService.getTemplates(req.userNumber);
    return { message: 'WABA templates fetched', result };
  }

  @Post('templates/sync')
  async syncTemplates(@Body('deviceId') deviceId: number, @Req() req: any) {
    const result = await this.wabaService.syncTemplatesFromMeta(req.userNumber, deviceId);
    return { message: 'Templates synced from Meta', result };
  }

  @Post('templates/create')
  async createTemplate(@Body() body: any, @Req() req: any) {
    const result = await this.wabaService.createTemplate(req.userNumber, body);
    return { message: 'WABA template created', result };
  }

  // ---------------- MESSAGING ----------------
  @Post('send-single')
  async sendSingle(@Body() body: { deviceId?: number; to: string; text: string }, @Req() req: any) {
    if (req.user?.isExpired) {
      return { status: false, message: 'Subscription expired. Please renew your plan on the Subscription page.', result: null };
    }
    const result = await this.wabaService.sendSingleMessage(req.userNumber, body);
    return { message: 'Message sent via Meta Cloud API', result };
  }

  @Post('dynamic-message')
  async sendDynamic(@Body() body: { deviceId?: number; to: string; templateName: string; language?: string; parameters: string[] }, @Req() req: any) {
    if (req.user?.isExpired) {
      return { status: false, message: 'Subscription expired. Please renew your plan on the Subscription page.', result: null };
    }
    const result = await this.wabaService.sendDynamicMessage(req.userNumber, body);
    return { message: 'Dynamic template message sent', result };
  }

  @Post('bulk-messages')
  async sendBulk(@Body() body: { deviceId?: number; numbers: string[]; templateName: string; language?: string; parameters?: string[] }, @Req() req: any) {
    if (req.user?.isExpired) {
      return { status: false, message: 'Subscription expired. Please renew your plan on the Subscription page.', result: null };
    }
    const result = await this.wabaService.sendBulkMessages(req.userNumber, body);
    return { message: 'WABA bulk broadcast completed', result };
  }

  // ---------------- AUTOMATION ----------------
  @Get('automation')
  async getAutomations(@Req() req: any) {
    const result = await this.wabaService.getAutomations(req.userNumber);
    return { message: 'WABA automations fetched', result };
  }

  @Post('automation')
  async createAutomation(@Body() body: any, @Req() req: any) {
    const result = await this.wabaService.createAutomation(req.userNumber, body);
    return { message: 'WABA automation created', result };
  }

  @Delete('automation/:id')
  async deleteAutomation(@Param('id') id: number, @Req() req: any) {
    await this.wabaService.deleteAutomation(req.userNumber, id);
    return { message: 'WABA automation deleted' };
  }

  // ---------------- CAMPAIGNS ----------------
  @Get('campaigns')
  async getCampaigns(@Req() req: any) {
    const result = await this.wabaService.getCampaigns(req.userNumber);
    return { message: 'WABA campaigns fetched', result };
  }

  @Post('campaigns')
  async createCampaign(@Body() body: any, @Req() req: any) {
    if (req.user?.isExpired) {
      return { status: false, message: 'Subscription expired. Please renew your plan on the Subscription page.', result: null };
    }
    const result = await this.wabaService.createCampaign(req.userNumber, body);
    return { message: 'WABA campaign scheduled', result };
  }

  @Delete('campaigns/:id')
  async deleteCampaign(@Param('id') id: number, @Req() req: any) {
    await this.wabaService.deleteCampaign(req.userNumber, id);
    return { message: 'WABA campaign deleted' };
  }

  // ---------------- FLOW BUILDER ----------------
  @Get('flows')
  async getFlows(@Req() req: any) {
    const result = await this.wabaService.getFlows(req.userNumber);
    return { message: 'WABA flows fetched', result };
  }

  @Post('flows')
  async createFlow(@Body() body: any, @Req() req: any) {
    const result = await this.wabaService.createFlow(req.userNumber, body);
    return { message: 'WABA flow created', result };
  }

  @Delete('flows/:id')
  async deleteFlow(@Param('id') id: number, @Req() req: any) {
    await this.wabaService.deleteFlow(req.userNumber, id);
    return { message: 'WABA flow deleted' };
  }
}
