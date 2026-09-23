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
import { RcsAgent } from './models/RcsAgent';
import { RcsTemplate } from './models/RcsTemplate';
import { RcsCampaign } from './models/RcsCampaign';
import { RcsAutomation } from './models/RcsAutomation';
import { RcsFlow } from './models/RcsFlow';
import { ContactName } from './models/ContactName';

function postgresSsl(dbUrl: string): false | { rejectUnauthorized: false } {
  if (process.env.DATABASE_SSL === 'false') return false;
  if (process.env.DATABASE_SSL === 'true') return { rejectUnauthorized: false };

  const sslmode = (dbUrl.match(/[?&]sslmode=([^&]+)/i)?.[1] || '').toLowerCase();
  if (['require', 'prefer', 'verify-ca', 'verify-full', 'no-verify', 'true'].includes(sslmode)) {
    return { rejectUnauthorized: false };
  }

  // Supabase closes a plain connection. TLS stays on even when sslmode was removed from the URL.
  if (/supabase\.(co|com)/i.test(dbUrl)) {
    return { rejectUnauthorized: false };
  }

  return false;
}

@Module({
  imports: [
    SequelizeModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => {
        const dbUrl = configService.get<string>('DATABASE_URL');

        if (!dbUrl) {
          throw new Error('DATABASE_URL environment variable is not defined');
        }

        const ssl = postgresSsl(dbUrl);
        console.log(`Postgres SSL: ${ssl ? 'on' : 'off'}`);

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
            RcsAgent,
            RcsTemplate,
            RcsCampaign,
            RcsAutomation,
            RcsFlow,
            ContactName,
          ],
          autoLoadModels: true,
          synchronize: true,
          sync: {
            alter: true,
          },
          logging: false,
          pool: {
            max: 10,
            min: 0,
            acquire: 30000,
            idle: 10000,
          },
          dialectOptions: {
            ssl,
            keepAlive: true,
            keepAliveInitialDelayMillis: 10000,
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
      RcsAgent,
      RcsTemplate,
      RcsCampaign,
      RcsAutomation,
      RcsFlow,
      ContactName,
    ]),
  ],
  exports: [SequelizeModule],
})
export class DatabaseModule {}
