import { Injectable, ConflictException, NotFoundException, UnauthorizedException, ForbiddenException } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import * as crypto from 'crypto';
import { User } from '../database/models/User';
import { Token } from '../database/models/Token';
import { Plan } from '../database/models/Plan';
import { Stat } from '../database/models/Stat';
import { MessageLog } from '../database/models/MessageLog';
import { ScheduledMessage } from '../database/models/ScheduledMessage';

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
        throw new ForbiddenException('Account is currently inactive');
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
    if (user) {
      profile = user.toJSON();
      delete profile.password;
    }

    return {
      totalSent: userSentCount || (stat ? stat.totalMessagesSent : 0),
      pendingScheduled,
      totalScheduled,
      profile,
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

  async buySubscription(userNumber: string, userType: string, planId: number) {
    const plan = await this.planModel.findByPk(planId);
    if (!plan) throw new NotFoundException('Invalid plan');

    const user = await this.userModel.findOne({ where: { number: userNumber, userType } });
    let newValidDays = user.validDays;
    let newCreatedAt = user.createdAt;

    const expiry = user.createdAt.getTime() + (user.validDays * 86400000);
    if (Date.now() < expiry) {
      newValidDays += plan.days;
    } else {
      newCreatedAt = new Date();
      newValidDays = plan.days;
    }

    await user.update({ validDays: newValidDays, createdAt: newCreatedAt });
    const result = user.toJSON();
    delete result.password;
    return result;
  }
}
