import { Module } from '@nestjs/common';
import { EmailService } from './email.service';
import QueueService from './queue.service';
import { BullModule } from '@nestjs/bull';
import authConfig from 'config/auth.config';
import EmailQueueConsumer from './email.consumer';

@Module({
  providers: [EmailService, QueueService, EmailQueueConsumer],
  exports: [EmailService, QueueService],
  imports: [
    BullModule.registerQueueAsync({
      name: 'emailSending',
    }),
  ],
})
export class EmailModule {}
