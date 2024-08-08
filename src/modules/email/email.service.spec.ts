import { Test, TestingModule } from '@nestjs/testing';
import { EmailService } from './email.service';
import { MailerService } from '@nestjs-modules/mailer';
import QueueService, { MailSender } from './queue.service';
import { BullModule, getQueueToken } from '@nestjs/bull';
import { SendEmailDto, createTemplateDto, getTemplateDto } from './dto/email.dto';
import * as Handlebars from 'handlebars';
import * as htmlValidator from 'html-validator';
import * as fs from 'fs';
import { HttpStatus } from '@nestjs/common';
import { createFile, deleteFile, getFile } from '../../helpers/fileHelpers';
import { MailInterface } from './interfaces/MailInterface';

// Mock module-level functions
jest.mock('../../helpers/fileHelpers', () => ({
  createFile: jest.fn(),
  deleteFile: jest.fn(),
  getFile: jest.fn(),
}));

jest.mock('handlebars');
jest.mock('html-validator');
jest.mock('fs', () => ({
  promises: {
    readdir: jest.fn(),
    readFile: jest.fn(),
  },
}));

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
    expect(result).toEqual({jobId: jobMock.id});
  });

  
describe('createTemplate', () => {
    it('should create a template if HTML is valid', async () => {
      const templateInfo: createTemplateDto = { templateName: 'test', template: '<div></div>' };
      (htmlValidator as jest.Mock).mockResolvedValue({ messages: [] });
      (createFile as jest.Mock).mockResolvedValue(Promise.resolve());

      const result = await service.createTemplate(templateInfo);

      expect(result).toEqual({
        status_code: HttpStatus.CREATED,
        message: 'Template created successfully',
        validation_errors: [],
      });
      expect(createFile).toHaveBeenCalledWith('./src/modules/email/hng-templates', 'test.hbs', '<div></div>');
    });

    it('should return validation errors if HTML is invalid', async () => {
      const templateInfo: createTemplateDto = { templateName: 'test', template: '<div></div>' };
      (htmlValidator as jest.Mock).mockResolvedValue({ messages: [{ message: 'Invalid HTML', type: 'error' }] });

      const result = await service.createTemplate(templateInfo);

      expect(result).toEqual({
        status_code: HttpStatus.BAD_REQUEST,
        message: 'Invalid HTML format',
        validation_errors: ['Invalid HTML'],
      });
    });

    it('should handle errors during template creation', async () => {
      const templateInfo: createTemplateDto = { templateName: 'test', template: '<div></div>' };
      (htmlValidator as jest.Mock).mockRejectedValue(new Error('Validation error'));

      const result = await service.createTemplate(templateInfo);

      expect(result).toEqual({
        status_code: HttpStatus.INTERNAL_SERVER_ERROR,
        message: 'Something went wrong, please try again',
      });
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
