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
        template: 'Welcome-Template',
      });
      this.logger.log(`Welcome email sent successfully to ${mail.to}`);
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
      this.logger.log(`Waitlist email sent successfully to ${mail.to}`);
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
        template: 'Reset-Password-Template',
      });
      this.logger.log(`Reset password email sent successfully to ${mail.to}`);
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
      this.logger.log(`Newsletter email sent successfully to ${mail.to}`);
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
      this.logger.log(`Register OTP email sent successfully to ${mail.to}`);
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
      this.logger.log(`Login OTP email sent successfully to ${mail.to}`);
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
        template: 'login-otp',
      });
      this.logger.log(`Notification email sent successfully to ${mail.to}`);
    } catch (sendLoginOtpEmailJobError) {
      this.logger.error(`EmailQueueConsumer ~ sendLoginOtpEmailJobError:   ${sendLoginOtpEmailJobError}`);
    }
  }
}
