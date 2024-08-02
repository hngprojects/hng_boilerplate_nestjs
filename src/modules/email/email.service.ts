import { BadRequestException, HttpStatus, Injectable, InternalServerErrorException, Logger, NotFoundException } from '@nestjs/common';
import { SendEmailDto } from './dto/send-email.dto';
import { validateOrReject } from 'class-validator';
import * as Handlebars from 'handlebars';
import { createFile, deleteFile } from './email_storage.service';
import { MailerService } from '@nestjs-modules/mailer';
import { IMessageInterface } from './interface/message.interface';
import { CreateEmailTemplateDto } from './dto/create-email-template.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { EmailTemplate } from './entities/email-template.entity';
import { Repository } from 'typeorm';
import { promises as fs }  from 'fs';
import { UpdateEmailTemplateDto } from './dto/update-email-template.dto';

@Injectable()
export class EmailService {
  constructor(
    private readonly mailerService: MailerService,
    @InjectRepository(EmailTemplate)
    private readonly emailTemplatesRepository: Repository<EmailTemplate>,
  ) {}

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

  async checkFileExists(filePath: string): Promise<boolean> {
    try {
      await fs.access(filePath);
      return true;
    } catch (error) {
      if (error.code === 'ENOENT') {
        return false;
      } else {
        Logger.error('Error checking file existence', error);
        throw new InternalServerErrorException('Error checking file existence');
      }
    }
  }

  async createEmailTemplate(createEmailTemplateDto: CreateEmailTemplateDto) {
    const emailTempletePath = `./src/modules/email/templates/${createEmailTemplateDto.name}.hbs`;
    if (await this.checkFileExists(emailTempletePath)) {
      throw new BadRequestException({
        status_code: HttpStatus.BAD_REQUEST,
        error: 'Bad Request',
        message: 'Template name already exists',
      });
    }
    try {
      const html = Handlebars.compile(createEmailTemplateDto.content)({});
      await createFile('./src/modules/email/templates', `${createEmailTemplateDto.name}.hbs`, html);

      const emailTemplate = this.emailTemplatesRepository.create(createEmailTemplateDto)
      const  template = await this.emailTemplatesRepository.save(emailTemplate);
      return {
        status: 'success',
        message: 'Template created successfully',
        template
      };
    } catch (error) {
      return {
        status_code: HttpStatus.INTERNAL_SERVER_ERROR,
        error: 'Internal server error',
        message: 'Something went wrong, please try again',
      };
    }
  }

  async updateEmailTemplate(id: string, updateEmailTemplateDto: UpdateEmailTemplateDto) {
    // Check if template exists
    const emailTemplate = (await this.getEmailTemplate(id)).template;
    const emailTempletePath = `./src/modules/email/templates/${emailTemplate.name}.hbs`;
    if (!await this.checkFileExists(emailTempletePath)) {
      Logger.log('File not present in file system but present in db');
      throw new NotFoundException('Template not found');
    }

    // delete pre-existing file if both name and content are changed
    if (updateEmailTemplateDto.content && updateEmailTemplateDto.name) {
      try {
        const html = Handlebars.compile(updateEmailTemplateDto.content)({});
        await deleteFile(`./src/modules/email/templates/${emailTemplate.name}.hbs`);
        if (await this.checkFileExists(`./src/modules/email/templates/${updateEmailTemplateDto.name}.hbs`)) {
          await createFile('./src/modules/email/templates', `${emailTemplate.name}.hbs`, emailTemplate.content);
          throw new BadRequestException();
        }
        await createFile('./src/modules/email/templates', `${updateEmailTemplateDto.name}.hbs`, html);
      }
      catch (error) {
        if (error instanceof BadRequestException) throw new BadRequestException('Template name already exists')
        Logger.log('Error compiling html content', error)
        throw new InternalServerErrorException('Something went wrong, please try again');
      }
    }

    // update the contents of the file if only the content is changed
    if (updateEmailTemplateDto.content && !updateEmailTemplateDto.name) {
      try {
        const html = Handlebars.compile(updateEmailTemplateDto.content)({});
        await createFile('./src/modules/email/templates', `${emailTemplate.name}.hbs`, html);
      }
      catch (error) {
        Logger.log('Error compiling html content', error)
        throw new InternalServerErrorException('Something went wrong, please try again');
      }
    }

    // delete pre-existing file and create a new file with same content if only name is changed
    if (!updateEmailTemplateDto.content && updateEmailTemplateDto.name) {
      try {
        const html = Handlebars.compile(emailTemplate.content)({});
        await deleteFile(`./src/modules/email/templates/${emailTemplate.name}.hbs`);
        if (await this.checkFileExists(`./src/modules/email/templates/${updateEmailTemplateDto.name}.hbs`)) {
          await createFile('./src/modules/email/templates', `${emailTemplate.name}.hbs`, emailTemplate.content);
          throw new BadRequestException();
        }
        await createFile('./src/modules/email/templates', `${updateEmailTemplateDto.name}.hbs`, html);
      }
      catch (error) {
        if (error instanceof BadRequestException) throw new BadRequestException('Template name alredy exists')
        Logger.log('Error compiling html content', error)
        throw new InternalServerErrorException('Something went wrong, please try again');
      }
    }
    const template = await this.emailTemplatesRepository.update({ id }, updateEmailTemplateDto);
    return {
      status: 'success',
      message: 'Template updated successfully',
      template: await this.emailTemplatesRepository.findBy({ id })
    }
  }

  async getEmailTemplate(id: string) {
    const emailTemplate = await this.emailTemplatesRepository.findOne({ where: { id }});
    if (!emailTemplate) {
      throw new NotFoundException('Template not found');
    }
    return {
      status: 'success',
      message: 'Template retrieved successfully',
      template: emailTemplate,
    };
  }

  async deleteEmailTemplate(id: string) {
    const emailTemplate = (await this.getEmailTemplate(id)).template;
    try {
      await deleteFile(`./src/modules/email/templates/${emailTemplate.name}.hbs`);
    } catch (error) {
      Logger.log('Not found in file system storage');
      throw new InternalServerErrorException('Template not found');
    }
    await this.emailTemplatesRepository.remove(emailTemplate);
    return {
      status: 'success',
      message: 'Template deleted successfully',
    };
  }

  async getAllEmailTemplates(page: number, limit: number) {
    const numberOfTemplates = await this.emailTemplatesRepository.count();
    const templates = await this.emailTemplatesRepository.find({
      skip: (page - 1) * limit,
      take: limit
    });
    return {
      status: 'success',
      message: 'Templates retreived successfully',
      templates,
      total: Math.ceil(numberOfTemplates / limit),
      page,
      limit,
    }
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
