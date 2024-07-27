import { Module } from '@nestjs/common';
import { TimezonesService } from './timezones.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TimezonesController } from './timezones.controller';
import { Timezone } from '../timezones/entities/timezone.entity';

@Module({
  controllers: [TimezonesController],
  providers: [TimezonesService],
  imports: [TypeOrmModule.forFeature([Timezone])],
})
export class TimezonesModule {}
