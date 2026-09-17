import { Injectable, ConflictException, NotFoundException, UnauthorizedException, ForbiddenException } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import * as crypto from 'crypto';
import axios from 'axios';
import { User } from '../database/models/User';
import { Token } from '../database/models/Token';
import { Plan } from '../database/models/Plan';
import { Stat } from '../database/models/Stat';
import { MessageLog } from '../database/models/MessageLog';
import { ScheduledMessage } from '../database/models/ScheduledMessage';
import { SubscriptionHistory } from '../database/models/SubscriptionHistory';

@Injectable()
export class UsersService {
  constructor(
    @InjectModel(User)
    private userModel: typeof User,
    @InjectModel(Token)
    private tokenModel: typeof Token,
    @InjectModel(Plan)
    private planModel: typeof Plan,
    @InjectModel(Stat)
    private statModel: typeof Stat,
    @InjectModel(MessageLog)
    private messageLogModel: typeof MessageLog,
    @InjectModel(ScheduledMessage)
    private scheduledMessageModel: typeof ScheduledMessage,
    @InjectModel(SubscriptionHistory)
    private subscriptionHistoryModel: typeof SubscriptionHistory,
  ) {}

  async seedAdmin() {
    const adminNum = '919999999999';
    const adminPass = 'admin123';

    let [admin] = await this.userModel.findOrCreate({
      where: { number: adminNum, userType: 'admin' },
      defaults: {
        number: adminNum,
        name: 'Default Admin',
        gender: 'Male',
        password: adminPass,
        userType: 'admin',
        validDays: 3650,
        isActive: true,
      },
    });

    if (admin.password !== adminPass || !admin.isActive) {
      await admin.update({ password: adminPass, isActive: true, validDays: 3650 });
    }

    const token = crypto.randomBytes(24).toString('hex');
    await this.tokenModel.create({
      token,
      number: admin.number,
      userType: admin.userType,
    });

    const resultUser = admin.toJSON();
    delete resultUser.password;

    return { token, user: resultUser };
  }

  async register(data: any) {
    const { name, gender, number, password, userType } = data;
    const type = userType === 'admin' ? 'admin' : 'user';
    const cleanNumber = number.toString().replace(/\D/g, '');

    const existing = await this.userModel.findOne({
      where: { number: cleanNumber, userType: type },
    });

    if (existing) {
      throw new ConflictException(`An account with this number already exists as ${type}`);
    }

    const newUser = await this.userModel.create({
      number: cleanNumber,
      name: name || 'User',
      gender: gender || 'Not Specified',
      password,
      userType: type,
      validDays: type === 'admin' ? 3650 : 3,
      isActive: true,
    });

    const result = newUser.toJSON();
    delete result.password;
    return result;
  }

  async login(data: any) {
    const { number, password, userType } = data;
    const cleanNumber = number.toString().replace(/\D/g, '');

    const user = await this.userModel.findOne({
      where: { number: cleanNumber, userType: userType },
    });

    if (!user) {
      throw new NotFoundException(`User not found as ${userType}`);
    }

    if (user.password !== password) {
      throw new UnauthorizedException('Incorrect password');
    }

    if (!user.isActive) {
      if (user.userType === 'admin') {
        // Automatically activate admin accounts upon valid login
        await user.update({ isActive: true });
      } else {
        const expiryTime = user.subscriptionExpiry
          ? new Date(user.subscriptionExpiry).getTime()
          : (user.createdAt ? new Date(user.createdAt).getTime() : Date.now()) + (user.validDays * 86400000);

        const isExpired = Date.now() > expiryTime || user.validDays <= 0;

        if (!isExpired) {
          throw new ForbiddenException('Account is currently blocked by Administrator');
        }
        // Expired accounts are allowed to log in to renew their subscription
      }
    }

    const token = crypto.randomBytes(24).toString('hex');
    await this.tokenModel.create({
      token,
      number: user.number,
      userType: user.userType,
    });

    const resultUser = user.toJSON();
    delete resultUser.password;

    return { token, user: resultUser };
  }

  async getPlans() {
    return await this.planModel.findAll({ order: [['price', 'ASC']] });
  }

  async getDashboardData(userNumber: string, userType: string) {
    const user = await this.userModel.findOne({ where: { number: userNumber, userType } });
    const stat = await this.statModel.findOne({ where: { id: 1 } });

    const userSentCount = await this.messageLogModel.count({ where: { sender: userNumber } });
    const pendingScheduled = await this.scheduledMessageModel.count({
      where: { sender: userNumber, status: 'pending' }
    });
    const totalScheduled = await this.scheduledMessageModel.count({
      where: { sender: userNumber }
    });

    const recentLogs = await this.messageLogModel.findAll({
      where: { sender: userNumber },
      order: [['timestamp', 'DESC']],
      limit: 5,
    });

    let profile: any = {};
    let isExpired = false;
    let daysRemaining = 0;

    if (user) {
      profile = user.toJSON();
      delete profile.password;

      if (user.userType !== 'admin') {
        const expiryTime = user.subscriptionExpiry
          ? new Date(user.subscriptionExpiry).getTime()
          : (user.createdAt ? new Date(user.createdAt).getTime() : Date.now()) + (user.validDays * 86400000);

        const diffMs = expiryTime - Date.now();
        daysRemaining = Math.max(0, Math.ceil(diffMs / 86400000));
        isExpired = daysRemaining <= 0 || !user.isActive;

        profile.validDays = daysRemaining;
        profile.subscriptionExpiry = new Date(expiryTime);
      } else {
        daysRemaining = 3650;
        isExpired = false;
      }
    }

    const plans = await this.planModel.findAll({ order: [['price', 'ASC']] });

    return {
      totalSent: userSentCount || (stat ? stat.totalMessagesSent : 0),
      pendingScheduled,
      totalScheduled,
      isExpired,
      daysRemaining,
      plans,
      profile,
      user: profile,
      recentLogs,
    };
  }

  async updateProfile(userNumber: string, userType: string, data: any) {
    await this.userModel.update(data, { where: { number: userNumber, userType } });
    const user = await this.userModel.findOne({ where: { number: userNumber, userType } });
    const result = user.toJSON();
    delete result.password;
    return result;
  }

  async buySubscription(userNumber: string, userType: string, planIdInput: any, method: string = 'Direct') {
    const plan = (await this.planModel.findByPk(planIdInput)) ||
      (await this.planModel.findOne({ where: { planId: String(planIdInput) } }));

    if (!plan) throw new NotFoundException('Selected subscription plan does not exist');

    const user = await this.userModel.findOne({ where: { number: userNumber, userType } });
    if (!user) throw new NotFoundException('User account not found');

    const currentExpiry = user.subscriptionExpiry
      ? new Date(user.subscriptionExpiry).getTime()
      : (user.createdAt ? new Date(user.createdAt).getTime() : Date.now()) + (user.validDays * 86400000);

    let newExpiryTime = 0;
    if (Date.now() < currentExpiry) {
      newExpiryTime = currentExpiry + (plan.days * 86400000);
    } else {
      newExpiryTime = Date.now() + (plan.days * 86400000);
    }

    const newExpiryDate = new Date(newExpiryTime);
    const newValidDays = Math.max(0, Math.ceil((newExpiryTime - Date.now()) / 86400000));

    await user.update({
      validDays: newValidDays,
      subscriptionExpiry: newExpiryDate,
      isActive: true
    });

    // Record Subscription History
    try {
      const startDate = new Date();
      const expiryDate = newExpiryDate;
      await this.subscriptionHistoryModel.create({
        userNumber: user.number,
        userName: user.name || 'User',
        planName: plan.name,
        days: plan.days,
        price: plan.price,
        paymentMethod: method,
        startDate,
        expiryDate,
      });
    } catch (err: any) {
      console.error('⚠️ Failed to log subscription history:', err.message);
    }

    const result = user.toJSON();
    delete result.password;
    return result;
  }

  async createRazorpayOrder(userNumber: string, userType: string, planIdInput: any) {
    const keyId = process.env.RAZORPAY_KEY_ID;
    const keySecret = process.env.RAZORPAY_KEY_SECRET;

    const plan = (await this.planModel.findByPk(planIdInput)) ||
      (await this.planModel.findOne({ where: { planId: String(planIdInput) } }));

    if (!plan) throw new NotFoundException('Selected subscription plan does not exist');

    if (!keyId || !keySecret || !keyId.trim() || !keySecret.trim()) {
      return { isRazorpay: false, message: 'Razorpay keys not configured' };
    }

    try {
      const amountInPaise = Math.round(plan.price * 100);
      const authHeader = 'Basic ' + Buffer.from(`${keyId}:${keySecret}`).toString('base64');

      const response = await axios.post(
        'https://api.razorpay.com/v1/orders',
        {
          amount: amountInPaise,
          currency: 'INR',
          receipt: `rcpt_${Date.now()}`,
          notes: { planId: plan.planId, userNumber }
        },
        {
          headers: {
            'Authorization': authHeader,
            'Content-Type': 'application/json'
          }
        }
      );

      return {
        isRazorpay: true,
        keyId,
        orderId: response.data.id,
        amount: response.data.amount,
        currency: response.data.currency,
        planId: plan.id,
        planName: plan.name
      };
    } catch (err: any) {
      console.error('Razorpay order creation error:', err.response?.data || err.message);
      return { isRazorpay: false, message: 'Failed to create Razorpay order' };
    }
  }

  async verifyRazorpayPayment(userNumber: string, userType: string, body: any) {
    const { razorpayPaymentId, razorpayOrderId, razorpaySignature, planId } = body;
    const keySecret = process.env.RAZORPAY_KEY_SECRET;

    if (keySecret && razorpaySignature) {
      const generatedSignature = crypto
        .createHmac('sha256', keySecret)
        .update(`${razorpayOrderId}|${razorpayPaymentId}`)
        .digest('hex');

      if (generatedSignature !== razorpaySignature) {
        throw new ForbiddenException('Invalid Razorpay payment signature');
      }
    }

    return await this.buySubscription(userNumber, userType, planId, 'Razorpay');
  }
}
