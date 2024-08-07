import { Module } from '@nestjs/common';
import { SmsService } from './sms.service';
import { SmsController } from './sms.controller';
import { BullModule } from '@nestjs/bull';
import QueueService from 'src/modules/email/queue.service';
import SmsQueueService from './sms-queue.service';

@Module({
  imports: [
    BullModule.registerQueueAsync({
      name: 'sms',
    }),
  ],
  controllers: [SmsController],
  providers: [SmsService, SmsQueueService],
})
export class SmsModule {}
