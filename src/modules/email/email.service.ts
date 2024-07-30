import { Injectable } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bull';
import { Queue } from 'bull';
import { SendEmailDto } from './dto/email.dto';
import { validateOrReject } from 'class-validator';

@Injectable()
export class EmailService {
  constructor(@InjectQueue('email') private readonly emailQueue: Queue) {}

  async sendEmail(emailData: SendEmailDto) {
    await validateOrReject(emailData);
    await this.emailQueue.add(emailData);
    return { message: 'Email added to the queue' };
  }
}
