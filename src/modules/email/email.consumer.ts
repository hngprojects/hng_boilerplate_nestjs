import { MailerService } from '@nestjs-modules/mailer';
import { Process, Processor } from '@nestjs/bull';
import { MailInterface } from './interfaces/MailInterface';
import { Job } from 'bull';

@Processor('emailSending')
export default class EmailQueueConsumer {
  constructor(private readonly mailerService: MailerService) {}

  @Process('welcome')
  async sendWelcomeEmailJob(job: Job<MailInterface>) {
    const { data } = job;
    await this.mailerService.sendMail({
      ...data,
      subject: 'Welcome to My App! Confirm your Email',
      template: 'confirmation',
    });
  }

  @Process('waitlist')
  async sendWaitlistEmailJob(job: Job<MailInterface>) {
    const { data } = job;
    await this.mailerService.sendMail({
      ...data,
      subject: 'Welcome to My App! Confirm your Email',
      template: 'confirmation',
    });
  }

  @Process('reset-password')
  async sendResetPasswordEmailJob(job: Job<MailInterface>) {
    const { data } = job;
    await this.mailerService.sendMail({
      ...data,
      subject: 'Welcome to My App! Confirm your Email',
      template: 'confirmation',
    });
  }

  @Process('newsletter')
  async sendNewsletterEmailJob(job: Job<MailInterface>) {
    const { data } = job;
    await this.mailerService.sendMail({
      ...data,
      subject: 'Welcome to My App! Confirm your Email',
      template: 'confirmation',
    });
  }

  @Process('token')
  async sendTokenEmailJob(job: Job<MailInterface>) {
    const { data } = job;
    await this.mailerService.sendMail({
      ...data,
      subject: 'Welcome to My App! Confirm your Email',
      template: 'confirmation',
    });
  }

  @Process('login-otp')
  async sendLoginOtpEmailJob(job: Job<MailInterface>) {
    const { data } = job;
    await this.mailerService.sendMail({
      ...data,
      subject: 'Welcome to My App! Confirm your Email',
      template: 'confirmation',
    });
  }
}
