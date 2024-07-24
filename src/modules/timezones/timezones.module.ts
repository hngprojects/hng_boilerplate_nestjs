import { Module } from '@nestjs/common';
import { TimezonesService } from './timezones.service';
import { TimezonesController } from './timezones.controller';

@Module({
  controllers: [TimezonesController],
  providers: [TimezonesService],
})
export class TimezonesModule {}
