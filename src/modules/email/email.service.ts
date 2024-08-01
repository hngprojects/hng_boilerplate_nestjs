import { HttpStatus, Injectable } from '@nestjs/common';
import { SendEmailDto, createTemplateDto, getTemplateDto } from './dto/email.dto';
import { validateOrReject } from 'class-validator';
import * as Handlebars from 'handlebars';
import { createFile, deleteFile, getFile } from './email_storage.service';
import * as htmlValidator from 'html-validator';
import * as fs from 'fs';
import { promisify } from 'util';
import * as path from 'path';
import { MailerService } from '@nestjs-modules/mailer';

@Injectable()
export class EmailService {
  constructor(private readonly mailerService: MailerService) {}

  async sendEmail(emailData: SendEmailDto) {
    await validateOrReject(emailData);
    try {
      await this.mailerService.sendMail(emailData);
      return {
        status_code: HttpStatus.OK,
        message: 'Email sent successfully',
      };
    } catch (error) {
      return {
        status_code: HttpStatus.INTERNAL_SERVER_ERROR,
        message: 'There was an error sending the email, please try again',
      };
    }
  }

  async createTemplate(templateInfo: createTemplateDto) {
    try {
      const html = Handlebars.compile(templateInfo.template)({});

      const validationResult = await htmlValidator({ data: html });

      const filteredMessages = validationResult.messages.filter(
        message =>
          !(
            (message.message.includes('Trailing slash on void elements has no effect') && message.type === 'info') ||
            (message.message.includes('Consider adding a “lang” attribute') && message.subType === 'warning')
          )
      );

      const response = {
        status_code: HttpStatus.CREATED,
        message: 'Template created successfully',
        validation_errors: [] as string[],
      };

      if (filteredMessages.length > 0) {
        response.status_code = HttpStatus.BAD_REQUEST;
        response.message = 'Invalid HTML format';
        response.validation_errors = filteredMessages.map(msg => msg.message);
      }

      if (response.status_code === HttpStatus.CREATED) {
        await createFile('./src/modules/email/templates', `${templateInfo.templateName}.hbs`, html);
      }

      return response;
    } catch (error) {
      return {
        status_code: HttpStatus.INTERNAL_SERVER_ERROR,
        message: 'Something went wrong, please try again',
      };
    }
  }

  async getTemplate(templateInfo: getTemplateDto) {
    try {
      const template = await getFile(`./src/modules/email/templates/${templateInfo.templateName}.hbs`, 'utf-8');
      console.log(template);

      return {
        status_code: HttpStatus.OK,
        message: 'Template retrieved successfully',
        template: template,
      };
    } catch (error) {
      return {
        status_code: HttpStatus.NOT_FOUND,
        message: 'Template not found',
      };
    }
  }

  async deleteTemplate(templateInfo: getTemplateDto) {
    try {
      await deleteFile(`./src/modules/email/templates/${templateInfo.templateName}.hbs`);
      return {
        status_code: HttpStatus.OK,
        message: 'Template deleted successfully',
      };
    } catch (error) {
      return {
        status_code: HttpStatus.NOT_FOUND,
        message: 'Template not found',
      };
    }
  }

  async getAllTemplates() {
    try {
      const templatesDirectory = './src/modules/email/templates';
      const files = await promisify(fs.readdir)(templatesDirectory);

      const templates = await Promise.all(
        files.map(async file => {
          if (path.extname(file) !== '.hbs') return null;

          const file_path = path.join(templatesDirectory, file);
          const content = await promisify(fs.readFile)(file_path, 'utf-8');

          return {
            template_name: path.basename(file),
            content: content,
          };
        })
      );

      const validTemplates = templates.filter(template => template !== null);
      return {
        status_code: HttpStatus.OK,
        message: 'Templates retrieved successfully',
        templates: validTemplates,
      };
    } catch (error) {
      console.log(error);
      return {
        status_code: HttpStatus.NOT_FOUND,
        message: 'Template not found',
      };
    }
  }
}
