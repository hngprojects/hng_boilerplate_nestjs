import { Process, Processor } from '@nestjs/bull';
import { Logger } from '@nestjs/common';
import { SmsService } from './sms.service';
import { Job } from 'bull';
import { Twilio } from 'twilio';
import smsConfig from 'config/sms.config';
import { CreateSmsDto } from './dto/create-sms.dto';

@Processor('sms')
export class SmsQueueConsumer {
  private logger = new Logger(SmsQueueConsumer.name);
  constructor(private readonly smsService: SmsService) {}

  @Process('sendSms')
  async handleSendSms(job: Job<CreateSmsDto>) {
    try {
      const { phone_number, message } = job.data;
      await this.smsService.sendSms(phone_number, message);
      this.logger.log(`sms sent to ${phone_number}`);
    } catch (sendSmsJobError) {
      this.logger.error(`SmsQueueConsumer ~ sendSmsJobError:  ${sendSmsJobError}`);
    }
  }
}
