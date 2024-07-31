import { Injectable } from '@nestjs/common';
import { ArticleInterface } from './article.interface';
import { MailInterface } from './interfaces/MailInterface';
import QueueService from './queue.service';

@Injectable()
export class EmailService {
  constructor(private readonly mailerService: QueueService) {}

  async sendUserConfirmationMail(email: string, url: string, token: string) {
    const link = `${url}?token=${token}`;
    const mailPayload: MailInterface = {
      to: email,
      context: {
        link,
        email,
      },
    };

    this.mailerService.sendMail({ variant: 'welcome', mail: mailPayload });
  }

  async sendUserEmailConfirmationOtp(email: string, otp: string) {
    const mailPayload: MailInterface = {
      to: email,
      context: {
        otp,
        email,
      },
    };

    this.mailerService.sendMail({ variant: 'welcome', mail: mailPayload });
  }

  async sendForgotPasswordMail(email: string, url: string, token: string) {
    const link = `${url}?token=${token}`;
    const mailPayload: MailInterface = {
      to: email,
      context: {
        link,
        email,
      },
    };

    await this.mailerService.sendMail({ variant: 'reset-password', mail: mailPayload });
  }

  async sendWaitListMail(email: string, url: string) {
    const mailPayload: MailInterface = {
      to: email,
      context: {
        url,
        email,
      },
    };

    await this.mailerService.sendMail({ variant: 'waitlist', mail: mailPayload });
  }

  async sendNewsLetterMail(email: string, articles: ArticleInterface[]) {
    const mailPayload: MailInterface = {
      to: email,
      context: {
        email,
        articles,
      },
    };

    await this.mailerService.sendMail({ variant: 'newsletter', mail: mailPayload });
  }

  async sendLoginOtp(email: string, token: string) {
    const mailPayload: MailInterface = {
      to: email,
      context: {
        email,
        token,
      },
    };

    await this.mailerService.sendMail({ variant: 'newsletter', mail: mailPayload });
  }
}
