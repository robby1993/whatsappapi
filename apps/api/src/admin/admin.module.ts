import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { AdminService } from './admin.service';
import { AdminController } from './admin.controller';
import { User } from '../database/models/User';
import { Token } from '../database/models/Token';
import { Session } from '../database/models/Session';
import { MessageLog } from '../database/models/MessageLog';
import { Plan } from '../database/models/Plan';
import { Stat } from '../database/models/Stat';
import { ScheduledMessage } from '../database/models/ScheduledMessage';
import { QueuedMessage } from '../database/models/QueuedMessage';

@Module({
  imports: [
    SequelizeModule.forFeature([
      User,
      Token,
      Session,
      MessageLog,
      Plan,
      Stat,
      ScheduledMessage,
      QueuedMessage,
    ]),
  ],
  providers: [AdminService],
  controllers: [AdminController],
})
export class AdminModule {}
