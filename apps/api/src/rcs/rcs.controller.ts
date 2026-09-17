import { Controller, Get, Post, Delete, Body, Param, Query, UseGuards, Req } from '@nestjs/common';
import { RcsService } from './rcs.service';
import { TokenAuthGuard } from '../auth/guards/token-auth.guard';

@Controller('rcs')
@UseGuards(TokenAuthGuard)
export class RcsController {
  constructor(private rcsService: RcsService) {}

  // ---------------- AGENTS ----------------
  @Get('agents')
  async getAgents(@Req() req: any) {
    const result = await this.rcsService.getAgents(req.userNumber);
    return { message: 'RCS agents fetched', result };
  }

  @Post('agents')
  async addAgent(@Body() body: any, @Req() req: any) {
    const result = await this.rcsService.addAgent(req.userNumber, body);
    return { message: 'RCS agent created', result };
  }

  @Delete('agents/:id')
  async deleteAgent(@Param('id') id: number, @Req() req: any) {
    await this.rcsService.deleteAgent(req.userNumber, id);
    return { message: 'RCS agent deleted' };
  }

  // ---------------- TEMPLATES ----------------
  @Get('templates')
  async getTemplates(@Req() req: any) {
    const result = await this.rcsService.getTemplates(req.userNumber);
    return { message: 'RCS rich templates fetched', result };
  }

  @Post('templates')
  async createTemplate(@Body() body: any, @Req() req: any) {
    const result = await this.rcsService.createTemplate(req.userNumber, body);
    return { message: 'RCS template created', result };
  }

  @Delete('templates/:id')
  async deleteTemplate(@Param('id') id: number, @Req() req: any) {
    await this.rcsService.deleteTemplate(req.userNumber, id);
    return { message: 'RCS template deleted' };
  }

  // ---------------- MESSAGING ----------------
  @Post('send-single')
  async sendSingle(@Body() body: any, @Req() req: any) {
    if (req.user?.isExpired) {
      return { status: false, message: 'Subscription expired. Please renew your plan on the Subscription page.', result: null };
    }
    const result = await this.rcsService.sendSingleRcs(req.userNumber, body);
    return { message: 'Message sent via Google RCS API', result };
  }

  @Post('dynamic-card')
  async sendDynamicCard(@Body() body: any, @Req() req: any) {
    if (req.user?.isExpired) {
      return { status: false, message: 'Subscription expired. Please renew your plan on the Subscription page.', result: null };
    }
    const result = await this.rcsService.sendDynamicCard(req.userNumber, body);
    return { message: 'RCS Dynamic Rich Card sent', result };
  }

  @Post('bulk-messages')
  async sendBulk(@Body() body: any, @Req() req: any) {
    if (req.user?.isExpired) {
      return { status: false, message: 'Subscription expired. Please renew your plan on the Subscription page.', result: null };
    }
    const result = await this.rcsService.sendBulkRcs(req.userNumber, body);
    return { message: 'RCS Bulk Broadcast initiated', result };
  }

  // ---------------- AUTOMATION ----------------
  @Get('automation')
  async getAutomations(@Req() req: any) {
    const result = await this.rcsService.getAutomations(req.userNumber);
    return { message: 'RCS automations fetched', result };
  }

  @Post('automation')
  async createAutomation(@Body() body: any, @Req() req: any) {
    const result = await this.rcsService.createAutomation(req.userNumber, body);
    return { message: 'RCS automation created', result };
  }

  @Delete('automation/:id')
  async deleteAutomation(@Param('id') id: number, @Req() req: any) {
    await this.rcsService.deleteAutomation(req.userNumber, id);
    return { message: 'RCS automation deleted' };
  }

  // ---------------- CAMPAIGNS ----------------
  @Get('campaigns')
  async getCampaigns(@Req() req: any) {
    const result = await this.rcsService.getCampaigns(req.userNumber);
    return { message: 'RCS campaigns fetched', result };
  }

  @Post('campaigns')
  async createCampaign(@Body() body: any, @Req() req: any) {
    if (req.user?.isExpired) {
      return { status: false, message: 'Subscription expired. Please renew your plan on the Subscription page.', result: null };
    }
    const result = await this.rcsService.createCampaign(req.userNumber, body);
    return { message: 'RCS campaign scheduled', result };
  }

  @Delete('campaigns/:id')
  async deleteCampaign(@Param('id') id: number, @Req() req: any) {
    await this.rcsService.deleteCampaign(req.userNumber, id);
    return { message: 'RCS campaign deleted' };
  }

  // ---------------- FLOW BUILDER ----------------
  @Get('flows')
  async getFlows(@Req() req: any) {
    const result = await this.rcsService.getFlows(req.userNumber);
    return { message: 'RCS flows fetched', result };
  }

  @Post('flows')
  async createFlow(@Body() body: any, @Req() req: any) {
    const result = await this.rcsService.createFlow(req.userNumber, body);
    return { message: 'RCS flow created', result };
  }

  @Delete('flows/:id')
  async deleteFlow(@Param('id') id: number, @Req() req: any) {
    await this.rcsService.deleteFlow(req.userNumber, id);
    return { message: 'RCS flow deleted' };
  }
}
