import { Module } from '@nestjs/common';
import { EmailService } from './email.service';
import QueueService from './queue.service';
import { BullModule } from '@nestjs/bull';
import authConfig from 'config/auth.config';

@Module({
  providers: [EmailService, QueueService],
  exports: [EmailService, QueueService],
  imports: [
    BullModule.registerQueueAsync({
      name: 'emailSending',
      useFactory: () => ({
        redis: {
          host: authConfig().redis.host,
          port: +authConfig().redis.port,
        },
      }),
    }),
  ],
})
export class EmailModule {}
