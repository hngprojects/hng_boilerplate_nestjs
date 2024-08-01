import { MailerService } from '@nestjs-modules/mailer';
import { Injectable } from '@nestjs/common';
import { ArticleInterface } from './interface/article.interface';
import { IMessageInterface } from './interface/message.interface';

@Injectable()
export class EmailService {
  constructor(private readonly mailerService: MailerService) {}

  async sendUserConfirmationMail(email: string, url: string, token: string) {
    const link = `${url}?token=${token}`;
    await this.mailerService.sendMail({
      to: email,
      subject: 'Welcome to My App! Confirm your Email',
      template: 'confirmation',
      context: {
        link,
        email,
      },
    });
  }

  async sendUserEmailConfirmationOtp(email: string, otp: string) {
    await this.mailerService.sendMail({
      to: email,
      subject: 'Welcome to My App! Confirm your Email',
      template: 'register-otp',
      context: {
        otp,
        email,
      },
    });
  }

  async sendForgotPasswordMail(email: string, url: string, token: string) {
    const link = `${url}?token=${token}`;
    await this.mailerService.sendMail({
      to: email,
      subject: 'Reset Password',
      template: 'reset-password',
      context: {
        link,
        email,
      },
    });
  }

  async sendWaitListMail(email: string, url: string) {
    await this.mailerService.sendMail({
      to: email,
      subject: 'Waitlist Confirmation',
      template: 'waitlist',
      context: {
        url,
        email,
      },
    });
  }

  async sendNewsLetterMail(email: string, articles: ArticleInterface[]) {
    await this.mailerService.sendMail({
      to: email,
      subject: 'Monthly Newsletter',
      template: 'newsletter',
      context: {
        email,
        articles,
      },
    });
  }

  async sendLoginOtp(email: string, token: string) {
    await this.mailerService.sendMail({
      to: email,
      subject: 'Login with OTP',
      template: 'login-otp',
      context: {
        token,
        email,
      },
    });
  }

  async sendNotificationMail(email: string, notificationMail: IMessageInterface) {
    const { recipient_name, message, support_email } = notificationMail;
    await this.mailerService.sendMail({
      to: email,
      subject: 'In-App, Notification',
      template: 'notification',
      context: {
        email,
        recipient_name,
        message,
        support_email,
      },
    });
  }
}
