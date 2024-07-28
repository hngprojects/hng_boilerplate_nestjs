import { Injectable, HttpStatus } from '@nestjs/common';
import { MailerService } from '@nestjs-modules/mailer';
import { ArticleInterface } from './article.interface';
import { join } from 'path';
import { promises as fs, existsSync } from 'fs';

@Injectable()
export class EmailService {
  private readonly templatesPath = join(__dirname, 'templates');
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

  async getTemp(templateName: string): Promise<string> {
    const filePath = join(this.templatesPath, `${templateName}.hbs`);

    if (!existsSync(filePath)) return null;
    const templateContent = await fs.readFile(filePath, 'utf-8');
    return templateContent;
  }

  async getTemplate(templateName: string) {
    const template = await this.getTemp(templateName);
    if (!template)
      return {
        status: false,
        status_code: HttpStatus.NOT_FOUND,
        message: 'Template not found',
      };
    return {
      data: { template: template },
    };
  }

  async getAllTemplates() {
    try {
      const files = await fs.readdir(this.templatesPath);
      const templates = {};
      for (const file of files) {
        const templateName = file.replace('.hbs', '');
        templates[templateName] = await this.getTemp(templateName);
      }
      return { data: { templates } };
    } catch (err) {
      throw new Error(`Error reading templates: ${err.message}`);
    }
  }
}
