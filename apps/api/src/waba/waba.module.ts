import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { WabaService } from './waba.service';
import { WabaController } from './waba.controller';
import { WabaDevice } from '../database/models/WabaDevice';
import { WabaTemplate } from '../database/models/WabaTemplate';
import { WabaCampaign } from '../database/models/WabaCampaign';
import { WabaAutomation } from '../database/models/WabaAutomation';
import { WabaFlow } from '../database/models/WabaFlow';
import { MessageLog } from '../database/models/MessageLog';

@Module({
  imports: [
    SequelizeModule.forFeature([
      WabaDevice,
      WabaTemplate,
      WabaCampaign,
      WabaAutomation,
      WabaFlow,
      MessageLog,
    ]),
  ],
  providers: [WabaService],
  controllers: [WabaController],
  exports: [WabaService],
})
export class WabaModule {}
