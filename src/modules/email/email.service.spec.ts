import { Test, TestingModule } from '@nestjs/testing';
import { EmailService } from './email.service';
import { MailerService } from '@nestjs-modules/mailer';
import QueueService, { MailSender } from './queue.service';
import { BullModule, getQueueToken } from '@nestjs/bull';
import { SendEmailDto, createTemplateDto, getTemplateDto, UpdateTemplateDto } from './dto/email.dto';
import * as Handlebars from 'handlebars';
import * as htmlValidator from 'html-validator';
import * as fs from 'fs';
import { HttpStatus } from '@nestjs/common';
import { MailInterface } from './interfaces/MailInterface';
import { CustomHttpException } from '../../helpers/custom-http-filter';
import { deleteFile, getFile } from './email_storage.service';
import { promisify } from 'util';
import * as SYS_MSG from '../../helpers/SystemMessages';
import * as util from 'util';

jest.mock('./email_storage.service', () => ({
  createFile: jest.fn(),
  deleteFile: jest.fn(),
  getFile: jest.fn(),
}));

jest.spyOn(util, 'promisify').mockImplementation(fn => {
  if (fn === fs.writeFile) {
    return jest.fn().mockResolvedValue(undefined);
  }
  return jest.fn().mockResolvedValue(undefined);
});

jest.mock('handlebars', () => ({
  compile: jest.fn(() =>
    jest.fn(() => '<!DOCTYPE html><html><head><title>Test</title></head><body>Hello, World!</body></html>')
  ),
}));

jest.mock('html-validator');
jest.mock('fs', () => {
  const originalModule = jest.requireActual('fs');
  return {
    ...originalModule,
    existsSync: jest.fn(() => true),
    writeFile: jest.fn(),
    promises: {
      exists: jest.fn(),
      readdir: jest.fn(),
      readFile: jest.fn(),
    },
  };
});

describe('EmailService', () => {
  let service: EmailService;
  let queueService: QueueService;
  let mailerService: MailerService;

  const mockMailerService = {
    sendMail: jest.fn().mockResolvedValue({}),
  };
  const mockQueue = {
    add: jest.fn().mockResolvedValue({ id: 'mockJobId' }),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        EmailService,
        QueueService,
        {
          provide: MailerService,
          useValue: mockMailerService,
        },
        {
          provide: getQueueToken('emailSending'),
          useValue: mockQueue,
        },
      ],
    }).compile();

    service = module.get<EmailService>(EmailService);
    mailerService = module.get<MailerService>(MailerService);
    queueService = module.get<QueueService>(QueueService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should send user confirmation email', async () => {
    const email = 'test@example.com';
    const url = 'http://example.com';
    const token = '123456';
    const link = `${url}?token=${token}`;

    const mailSender: MailSender = {
      variant: 'welcome',
      mail: {
        to: 'test@example.com',
        subject: 'Welcome!',
        body: 'Hello and welcome!',
      },
    };

    const jobMock = {
      id: '12345',
    };

    (mockQueue.add as jest.Mock).mockResolvedValue(jobMock);

    const result = await queueService.sendMail(mailSender);

    expect(mockQueue.add).toHaveBeenCalledWith(mailSender.variant, { mail: mailSender.mail });
    expect(result).toEqual({ jobId: jobMock.id });
  });

  describe('updateTemplate', () => {
    it('should update the template successfully', async () => {
      const templateName = 'testTemplate';
      const templateInfo: UpdateTemplateDto = {
        template: '<!DOCTYPE html><html><head><title>Test</title></head><body>Hello, World!</body></html>',
      };

      const compiledTemplate = '<!DOCTYPE html><html><head><title>Test</title></head><body>Hello, World!</body></html>';
      (Handlebars.compile as jest.Mock).mockReturnValue(() => compiledTemplate);
      const validationResult = { messages: [] };

      (htmlValidator as jest.Mock).mockResolvedValue(validationResult);

      const fsWriteFileMock = jest.fn().mockResolvedValue(undefined);

      (util.promisify as unknown as jest.Mock).mockReturnValue(fsWriteFileMock);
      (fs.existsSync as jest.Mock).mockReturnValue(true);

      const result = await service.updateTemplate(templateName, templateInfo);

      expect(htmlValidator).toHaveBeenCalledWith({ data: compiledTemplate });
      expect(fsWriteFileMock).toHaveBeenCalledWith(
        `./src/modules/email/templates/${templateName}.hbs`,
        compiledTemplate,
        'utf-8'
      );
      expect(result).toEqual({
        status_code: HttpStatus.OK,
        message: SYS_MSG.EMAIL_TEMPLATES.TEMPLATE_UPDATED_SUCCESSFULLY,
        data: {
          name: templateName,
          content: compiledTemplate,
        },
      });
    });

    it('should throw an error if HTML validation fails', async () => {
      const templateName = 'testTemplate';
      const templateInfo: UpdateTemplateDto = {
        template: '<!DOCTYPE html><html><head><title>Test</title></head><body>Hello, World!</body></html>',
      };

      const compiledTemplate = Handlebars.compile(templateInfo.template)({});
      const validationResult = {
        messages: [{ message: 'Invalid HTML', type: 'error' }],
      };

      (htmlValidator as jest.Mock).mockResolvedValue(validationResult);

      await expect(service.updateTemplate(templateName, templateInfo)).rejects.toThrow(CustomHttpException);

      expect(htmlValidator).toHaveBeenCalledWith({ data: compiledTemplate });
    });

    it('should throw an error if template does not exist', async () => {
      const templateName = 'nonExistentTemplate';
      const templateInfo: UpdateTemplateDto = {
        template: '<!DOCTYPE html><html><head><title>Test</title></head><body>Hello, World!</body></html>',
      };

      (fs.existsSync as jest.Mock).mockReturnValue(false);

      await expect(service.updateTemplate(templateName, templateInfo)).rejects.toThrow(CustomHttpException);
    });
  });

  describe('getTemplate', () => {
    it('should return the content of a template', async () => {
      const templateInfo: getTemplateDto = { templateName: 'test' };

      (getFile as jest.Mock).mockResolvedValue('template content');

      const result = await service.getTemplate(templateInfo);

      expect(result).toEqual({
        status_code: HttpStatus.OK,
        message: 'Template retrieved successfully',
        template: 'template content',
      });
    });

    it('should return NOT_FOUND if template does not exist', async () => {
      const templateInfo: getTemplateDto = { templateName: 'test' };

      (getFile as jest.Mock).mockRejectedValue(new Error('File not found'));

      const result = await service.getTemplate(templateInfo);

      expect(result).toEqual({
        status_code: HttpStatus.NOT_FOUND,
        message: 'Template not found',
      });
    });
  });

  describe('deleteTemplate', () => {
    it('should delete a template', async () => {
      const templateInfo: getTemplateDto = { templateName: 'test' };

      (deleteFile as jest.Mock).mockResolvedValue(Promise.resolve());

      const result = await service.deleteTemplate(templateInfo);

      expect(result).toEqual({
        status_code: HttpStatus.OK,
        message: 'Template deleted successfully',
      });
    });

    it('should return NOT_FOUND if template does not exist', async () => {
      const templateInfo: getTemplateDto = { templateName: 'test' };

      (deleteFile as jest.Mock).mockRejectedValue(new Error('File not found'));

      const result = await service.deleteTemplate(templateInfo);

      expect(result).toEqual({
        status_code: HttpStatus.NOT_FOUND,
        message: 'Template not found',
      });
    });
  });

  describe('getAllTemplates', () => {
    it('should handle errors when retrieving templates', async () => {
      (fs.promises.readdir as jest.Mock).mockRejectedValue(new Error('Error'));

      const result = await service.getAllTemplates();

      expect(result).toEqual({
        status_code: HttpStatus.NOT_FOUND,
        message: 'Template not found',
      });
    });
  });

  it('should send notification email', async () => {
    const email = 'test@example.com';
    const message = 'You have a new notification';
    const support_email = 'support@remotebingo.com';
    const recipient_name = 'John Doe';

    const mailSender: MailSender = {
      variant: 'in-app-notification',
      mail: {
        to: 'test@example.com',
        subject: 'n-App, Notification',
        context: {
          email,
          recipient_name,
          message,
          support_email,
        },
      },
    };

    const jobMock = {
      id: '12345',
    };

    (mockQueue.add as jest.Mock).mockResolvedValue(jobMock);

    const result = await queueService.sendMail(mailSender);

    expect(mockQueue.add).toHaveBeenCalledWith(mailSender.variant, { mail: mailSender.mail });
    expect(result).toEqual({ jobId: jobMock.id });
  });
});
