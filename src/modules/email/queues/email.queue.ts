import { Process, Processor } from '@nestjs/bull';
import { Job } from 'bull';
import { Injectable, Logger } from '@nestjs/common';
import { MailerService } from '@nestjs-modules/mailer';

@Injectable()
@Processor('email')
export class EmailQueue {
  constructor(private readonly mailerService: MailerService) {}

  @Process()
  async sendEmail(job: Job<{ to: string; subject: string; template: string; context: object }>) {
    const { to, subject, template, context } = job.data;
    try {
      await this.mailerService.sendMail({
        to,
        subject,
        template,
        context,
      });
    } catch (error) {
      Logger.log('Error sending email:', error);
    }
  }
}
