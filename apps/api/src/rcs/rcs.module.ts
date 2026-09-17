import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { RcsService } from './rcs.service';
import { RcsController } from './rcs.controller';
import { RcsAgent } from '../database/models/RcsAgent';
import { RcsTemplate } from '../database/models/RcsTemplate';
import { RcsCampaign } from '../database/models/RcsCampaign';
import { RcsAutomation } from '../database/models/RcsAutomation';
import { RcsFlow } from '../database/models/RcsFlow';
import { MessageLog } from '../database/models/MessageLog';

@Module({
  imports: [
    SequelizeModule.forFeature([
      RcsAgent,
      RcsTemplate,
      RcsCampaign,
      RcsAutomation,
      RcsFlow,
      MessageLog,
    ]),
  ],
  providers: [RcsService],
  controllers: [RcsController],
  exports: [RcsService],
})
export class RcsModule {}
