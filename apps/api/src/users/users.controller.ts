import { Controller, Post, Get, Body, UseGuards, Req } from '@nestjs/common';
import { UsersService } from './users.service';
import { TokenAuthGuard } from '../auth/guards/token-auth.guard';

@Controller('users')
export class UsersController {
  constructor(private usersService: UsersService) {}

  @Post('seed-admin')
  async seedAdmin() {
    const result = await this.usersService.seedAdmin();
    return { message: 'Admin account initialized', result };
  }

  @Post('register')
  async register(@Body() body: any) {
    const result = await this.usersService.register(body);
    return { message: 'Registration successful', result };
  }

  @Post('login')
  async login(@Body() body: any) {
    const result = await this.usersService.login(body);
    return { message: 'Login successful', result };
  }

  @Get('dashboard')
  @UseGuards(TokenAuthGuard)
  async getDashboard(@Req() req: any) {
    const result = await this.usersService.getDashboardData(req.userNumber, req.userType);
    return { message: 'Dashboard data fetched', result };
  }

  @Post('update-profile')
  @UseGuards(TokenAuthGuard)
  async updateProfile(@Body() body: any, @Req() req: any) {
    const result = await this.usersService.updateProfile(req.userNumber, req.userType, body);
    return { message: 'Profile updated successfully', result };
  }

  @Get('plans')
  @UseGuards(TokenAuthGuard)
  async getPlans() {
    const result = await this.usersService.getPlans();
    return { message: 'Plans fetched', result };
  }

  @Post('buy-subscription')
  @UseGuards(TokenAuthGuard)
  async buySubscription(@Body('planId') planId: any, @Req() req: any) {
    const result = await this.usersService.buySubscription(req.userNumber, req.userType, planId);
    return { message: 'Subscription purchased successfully', result };
  }

  @Post('create-razorpay-order')
  @UseGuards(TokenAuthGuard)
  async createRazorpayOrder(@Body('planId') planId: any, @Req() req: any) {
    const result = await this.usersService.createRazorpayOrder(req.userNumber, req.userType, planId);
    return { message: 'Razorpay order status fetched', result };
  }

  @Post('verify-razorpay-payment')
  @UseGuards(TokenAuthGuard)
  async verifyRazorpayPayment(@Body() body: any, @Req() req: any) {
    const result = await this.usersService.verifyRazorpayPayment(req.userNumber, req.userType, body);
    return { message: 'Payment verified and subscription activated', result };
  }
}
