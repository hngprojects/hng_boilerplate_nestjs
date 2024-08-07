import { Controller, HttpCode, HttpStatus, Post } from '@nestjs/common';
import { SmsService } from './sms.service';
import { CreateSmsDto } from './dto/create-sms.dto';
import QueueService from '../email/queue.service';
import SmsQueueService from './sms-queue.service';

@Controller('sms')
export class SmsController {
  constructor(
    private readonly smsQueueService: SmsQueueService,
    private readonly smsService: SmsService
  ) {}

  @Post('/send')
  @HttpCode(200)
  async sendSms(createSmsDto: CreateSmsDto) {
    const job = await this.smsQueueService.sendSms(createSmsDto);
    return {
      status: 'success',
      message: 'SMS is being processed in background',
      job: job,
    };
  }
}
