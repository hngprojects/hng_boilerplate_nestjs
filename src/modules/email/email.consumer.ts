import { MailerService } from '@nestjs-modules/mailer';
import { Process, Processor } from '@nestjs/bull';
import { MailInterface } from './interfaces/MailInterface';
import { Job } from 'bull';

@Processor('emailSending')
export default class EmailQueueConsumer {
  constructor(private readonly mailerService: MailerService) {}

  @Process('welcome')
  async sendWelcomeEmailJob(job: Job<MailInterface>) {
    try {
      const {
        data: { mail },
      } = job;
      await this.mailerService.sendMail({
        ...mail,
        subject: 'Welcome to My App! Confirm your Email',
        template: 'welcome',
      });
    } catch (sendWelcomeEmailJobError) {
      console.log('EmailQueueConsumer ~ sendWelcomeEmailJobError: ', sendWelcomeEmailJobError);
    }
  }

  @Process('waitlist')
  async sendWaitlistEmailJob(job: Job<MailInterface>) {
    try {
      const {
        data: { mail },
      } = job;

      await this.mailerService.sendMail({
        ...mail,
        subject: 'Waitlist Confirmation',
        template: 'waitlist',
      });
    } catch (sendWaitlistEmailJobError) {
      console.log('EmailQueueConsumer ~ sendWaitlistEmailJobError: ', sendWaitlistEmailJobError);
    }
  }

  @Process('reset-password')
  async sendResetPasswordEmailJob(job: Job<MailInterface>) {
    try {
      const {
        data: { mail },
      } = job;
      await this.mailerService.sendMail({
        ...mail,
        subject: 'Reset Password',
        template: 'reset-password',
      });
    } catch (sendResetPasswordEmailJobError) {
      console.log('EmailQueueConsumer ~ sendResetPasswordEmailJobError: ', sendResetPasswordEmailJobError);
    }
  }

  @Process('newsletter')
  async sendNewsletterEmailJob(job: Job<MailInterface>) {
    try {
      const {
        data: { mail },
      } = job;
      await this.mailerService.sendMail({
        ...mail,
        subject: 'Monthly Newsletter',
        template: 'newsletter',
      });
    } catch (sendNewsletterEmailJobError) {
      console.log('EmailQueueConsumer ~ sendNewsletterEmailJobError: ', sendNewsletterEmailJobError);
    }
  }

  @Process('register-otp')
  async sendTokenEmailJob(job: Job<MailInterface>) {
    try {
      const {
        data: { mail },
      } = job;
      await this.mailerService.sendMail({
        ...mail,
        subject: 'Welcome to My App! Confirm your Email',
        template: 'register-otp',
      });
    } catch (sendTokenEmailJobError) {
      console.log('EmailQueueConsumer ~ sendTokenEmailJobError: ', sendTokenEmailJobError);
    }
  }

  @Process('login-otp')
  async sendLoginOtpEmailJob(job: Job<MailInterface>) {
    try {
      const {
        data: { mail },
      } = job;
      await this.mailerService.sendMail({
        ...mail,
        subject: 'Login with OTP',
        template: 'login-otp',
      });
    } catch (sendLoginOtpEmailJobError) {
      console.log('EmailQueueConsumer ~ sendLoginOtpEmailJobError: ', sendLoginOtpEmailJobError);
    }
  }
}
