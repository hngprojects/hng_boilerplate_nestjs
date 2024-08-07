import { MailerService } from '@nestjs-modules/mailer';
import { Process, Processor } from '@nestjs/bull';
import { MailInterface } from './interfaces/MailInterface';
import { Job } from 'bull';
import { Logger } from '@nestjs/common';

@Processor('emailSending')
export default class EmailQueueConsumer {
  private logger = new Logger(EmailQueueConsumer.name);
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
      this.logger.error(`EmailQueueConsumer ~ sendWelcomeEmailJobError:  ${sendWelcomeEmailJobError}`);
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
      this.logger.error(`EmailQueueConsumer ~ sendWaitlistEmailJobError: ${sendWaitlistEmailJobError}`);
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
      this.logger.error(`EmailQueueConsumer ~ sendResetPasswordEmailJobError: ${sendResetPasswordEmailJobError}`);
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
      this.logger.error(`EmailQueueConsumer ~ sendNewsletterEmailJobError:   ${sendNewsletterEmailJobError}`);
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
      this.logger.error(`EmailQueueConsumer ~ sendTokenEmailJobError:   ${sendTokenEmailJobError}`);
    }
  }

  @Process('in-app-notification')
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
      this.logger.error(`EmailQueueConsumer ~ sendLoginOtpEmailJobError:   ${sendLoginOtpEmailJobError}`);
    }
  }

  @Process('login-otp')
  async sendNotificationMail(job: Job<MailInterface>) {
    try {
      const {
        data: { mail },
      } = job;
      await this.mailerService.sendMail({
        ...mail,
        subject: 'In-App, Notification',
        template: 'notification',
      });
    } catch (sendLoginOtpEmailJobError) {
      this.logger.error(`EmailQueueConsumer ~ sendLoginOtpEmailJobError:   ${sendLoginOtpEmailJobError}`);
    }
  }
}
