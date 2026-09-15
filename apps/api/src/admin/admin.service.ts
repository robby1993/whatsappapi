import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { User } from '../database/models/User';
import { MessageLog } from '../database/models/MessageLog';
import { Token } from '../database/models/Token';
import { Session } from '../database/models/Session';
import { Plan } from '../database/models/Plan';
import { Stat } from '../database/models/Stat';
import { ScheduledMessage } from '../database/models/ScheduledMessage';
import { QueuedMessage } from '../database/models/QueuedMessage';
import { Op } from 'sequelize';

@Injectable()
export class AdminService {
  constructor(
    @InjectModel(User) private userModel: typeof User,
    @InjectModel(MessageLog) private messageLogModel: typeof MessageLog,
    @InjectModel(Token) private tokenModel: typeof Token,
    @InjectModel(Session) private sessionModel: typeof Session,
    @InjectModel(Plan) private planModel: typeof Plan,
    @InjectModel(Stat) private statModel: typeof Stat,
    @InjectModel(ScheduledMessage) private scheduledMessageModel: typeof ScheduledMessage,
    @InjectModel(QueuedMessage) private queuedMessageModel: typeof QueuedMessage,
  ) {}

  async getStats() {
    const totalUsers = await this.userModel.count();
    const activeUsers = await this.userModel.count({ where: { isActive: true } });
    const totalMessages = await this.messageLogModel.count();

    return { totalUsers, activeUsers, totalMessages };
  }

  async getUsers(includeDeleted = false) {
    return await this.userModel.findAll({
      order: [['createdAt', 'DESC']],
      paranoid: !includeDeleted,
    });
  }

  async updateUser(number: string, data: any) {
    const [updated] = await this.userModel.update(data, { where: { number } });
    if (!updated) return null;
    return await this.userModel.findOne({ where: { number } });
  }

  async softDeleteUser(number: string, userType?: string) {
    const where: any = { number };
    if (userType) where.userType = userType;
    const user = await this.userModel.findOne({ where });
    if (!user) return null;
    await user.destroy();
    return true;
  }

  async hardDeleteUser(number: string, userType?: string) {
    const where: any = { number };
    if (userType) where.userType = userType;
    await this.userModel.destroy({ where, force: true });
    await this.tokenModel.destroy({ where: { number } });
    await this.sessionModel.destroy({ where: { phone: number } });
    return true;
  }

  async savePlan(data: any) {
      const { planId } = data;
      const existing = await this.planModel.findOne({ where: { planId } });
      if (existing) {
          return await existing.update(data);
      } else {
          return await this.planModel.create(data);
      }
  }

  async clearDatabase() {
    await this.userModel.destroy({ where: { userType: { [Op.ne]: 'admin' } }, force: true });
    await this.tokenModel.destroy({ where: {}, truncate: true });
    await this.messageLogModel.destroy({ where: {}, truncate: true });
    await this.planModel.destroy({ where: {}, truncate: true });
    await this.statModel.destroy({ where: {}, truncate: true });
    await this.scheduledMessageModel.destroy({ where: {}, truncate: true });
    await this.queuedMessageModel.destroy({ where: {}, truncate: true });
    return true;
  }

  async backupDatabase() {
    const users = await this.userModel.findAll();
    const messageLogs = await this.messageLogModel.findAll();
    const plans = await this.planModel.findAll();
    const scheduled = await this.scheduledMessageModel.findAll();
    const stats = await this.statModel.findAll();

    return {
      backupDate: new Date().toISOString(),
      database: 'whatsappapi',
      counts: {
        users: users.length,
        messageLogs: messageLogs.length,
        plans: plans.length,
        scheduled: scheduled.length,
      },
      tables: {
        users,
        messageLogs,
        plans,
        scheduled,
        stats,
      },
    };
  }
}
