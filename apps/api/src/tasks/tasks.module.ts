import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { TasksService } from './tasks.service';
import { WhatsappModule } from '../whatsapp/whatsapp.module';
import { QueuedMessage } from '../database/models/QueuedMessage';
import { ScheduledMessage } from '../database/models/ScheduledMessage';
import { MessageLog } from '../database/models/MessageLog';
import { Stat } from '../database/models/Stat';

@Module({
  imports: [
    SequelizeModule.forFeature([
      QueuedMessage,
      ScheduledMessage,
      MessageLog,
      Stat,
    ]),
    WhatsappModule,
  ],
  providers: [TasksService],
})
export class TasksModule {}
