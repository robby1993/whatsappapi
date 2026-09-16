import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { User } from './models/User';
import { Token } from './models/Token';
import { Session } from './models/Session';
import { ChatFlow } from './models/ChatFlow';
import { QueuedMessage } from './models/QueuedMessage';
import { ScheduledMessage } from './models/ScheduledMessage';
import { MessageLog } from './models/MessageLog';
import { Stat } from './models/Stat';
import { Plan } from './models/Plan';
import { ChatSession } from './models/ChatSession';
import { SubscriptionHistory } from './models/SubscriptionHistory';
import { WabaDevice } from './models/WabaDevice';
import { WabaTemplate } from './models/WabaTemplate';
import { WabaCampaign } from './models/WabaCampaign';
import { WabaAutomation } from './models/WabaAutomation';
import { WabaFlow } from './models/WabaFlow';

@Module({
  imports: [
    SequelizeModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => {
        const dbUrl = configService.get<string>('DATABASE_URL');

        if (!dbUrl) {
          throw new Error('DATABASE_URL environment variable is not defined');
        }

        const isRender = dbUrl.includes('render.com');

        return {
          dialect: 'postgres',
          uri: dbUrl,
          models: [
            User,
            Token,
            Session,
            ChatFlow,
            ChatSession,
            QueuedMessage,
            ScheduledMessage,
            MessageLog,
            Stat,
            Plan,
            SubscriptionHistory,
            WabaDevice,
            WabaTemplate,
            WabaCampaign,
            WabaAutomation,
            WabaFlow,
          ],
          autoLoadModels: true,
          synchronize: true,
          sync: {
            alter: true,
          },
          logging: false,
          dialectOptions: {
            ssl: isRender
              ? {
                  require: true,
                  rejectUnauthorized: false,
                }
              : false,
            keepAlive: true,
          },
        };
      },
      inject: [ConfigService],
    }),
    SequelizeModule.forFeature([
      User,
      Token,
      Session,
      ChatFlow,
      ChatSession,
      QueuedMessage,
      ScheduledMessage,
      MessageLog,
      Stat,
      Plan,
      SubscriptionHistory,
      WabaDevice,
      WabaTemplate,
      WabaCampaign,
      WabaAutomation,
      WabaFlow,
    ]),
  ],
  exports: [SequelizeModule],
})
export class DatabaseModule {}
