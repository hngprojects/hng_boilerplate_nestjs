import { Test, TestingModule } from '@nestjs/testing';
import { EmailService } from './email.service';
import { getQueueToken } from '@nestjs/bull';
import { Queue } from 'bull';
import { SendEmailDto, createTemplateDto, getTemplateDto } from './dto/email.dto';
import * as Handlebars from 'handlebars';
import * as htmlValidator from 'html-validator';
import * as fs from 'fs';
import * as path from 'path';
import { HttpStatus } from '@nestjs/common';

// Mock module-level functions
jest.mock('./email_storage.service', () => ({
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
  let emailQueue: Queue;

  const mockQueue = {
    add: jest.fn().mockResolvedValue({}),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        EmailService,
        {
          provide: getQueueToken('email'),
          useValue: mockQueue,
        },
      ],
    }).compile();

    service = module.get<EmailService>(EmailService);
    emailQueue = module.get<Queue>(getQueueToken('email'));
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should send email', async () => {
    const emailData = new SendEmailDto();
    emailData.to = 'test@example.com';
    emailData.subject = 'Test Subject';
    emailData.template = 'test-template';
    emailData.context = { key: 'value' };

    await service.sendEmail(emailData);

    expect(emailQueue.add).toHaveBeenCalledWith({
      to: emailData.to,
      subject: emailData.subject,
      template: emailData.template,
      context: emailData.context,
    });
  });

  describe('createTemplate', () => {
    it('should create a template if HTML is valid', async () => {
      const templateInfo: createTemplateDto = { templateName: 'test', template: '<div></div>' };
      (Handlebars.compile as jest.Mock).mockReturnValue(() => '<div></div>');
      (htmlValidator as jest.Mock).mockResolvedValue({ messages: [] });
      (require('./email_storage.service').createFile as jest.Mock).mockResolvedValue(Promise.resolve());

      const result = await service.createTemplate(templateInfo);

      expect(result).toEqual({
        status_code: HttpStatus.CREATED,
        message: 'Template created successfully',
        validation_errors: [],
      });
      expect(require('./email_storage.service').createFile).toHaveBeenCalledWith(
        './src/modules/email/templates',
        'test.hbs',
        '<div></div>'
      );
    });

    it('should return validation errors if HTML is invalid', async () => {
      const templateInfo: createTemplateDto = { templateName: 'test', template: '<div></div>' };
      (Handlebars.compile as jest.Mock).mockReturnValue(() => '<div></div>');
      (htmlValidator as jest.Mock).mockResolvedValue({ messages: [{ message: 'Invalid HTML', type: 'error' }] });
      (require('./email_storage.service').createFile as jest.Mock).mockResolvedValue(Promise.resolve());

      const result = await service.createTemplate(templateInfo);

      expect(result).toEqual({
        status_code: HttpStatus.BAD_REQUEST,
        message: 'Invalid HTML format',
        validation_errors: ['Invalid HTML'],
      });
    });

    it('should handle errors during template creation', async () => {
      const templateInfo: createTemplateDto = { templateName: 'test', template: '<div></div>' };
      (Handlebars.compile as jest.Mock).mockReturnValue(() => '<div></div>');
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
      (require('./email_storage.service').getFile as jest.Mock).mockResolvedValue('template content');

      const result = await service.getTemplate(templateInfo);

      expect(result).toEqual({
        status_code: HttpStatus.OK,
        message: 'Template retrieved successfully',
        template: 'template content',
      });
    });

    it('should return NOT_FOUND if template does not exist', async () => {
      const templateInfo: getTemplateDto = { templateName: 'test' };
      (require('./email_storage.service').getFile as jest.Mock).mockRejectedValue(new Error('File not found'));

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
      (require('./email_storage.service').deleteFile as jest.Mock).mockResolvedValue(Promise.resolve());

      const result = await service.deleteTemplate(templateInfo);

      expect(result).toEqual({
        status_code: HttpStatus.OK,
        message: 'Template deleted successfully',
      });
    });

    it('should return NOT_FOUND if template does not exist', async () => {
      const templateInfo: getTemplateDto = { templateName: 'test' };
      (require('./email_storage.service').deleteFile as jest.Mock).mockRejectedValue(new Error('File not found'));

      const result = await service.deleteTemplate(templateInfo);

      expect(result).toEqual({
        status_code: HttpStatus.NOT_FOUND,
        message: 'Template not found',
      });
    });
  });

  describe('getTemplate', () => {
    it('should return the content of a template', async () => {
      const templateInfo: getTemplateDto = { templateName: 'test' };
      (require('./email_storage.service').getFile as jest.Mock).mockResolvedValue('template content');

      const result = await service.getTemplate(templateInfo);

      expect(result).toEqual({
        status_code: HttpStatus.OK,
        message: 'Template retrieved successfully',
        template: 'template content',
      });
    });

    it('should return NOT_FOUND if template does not exist', async () => {
      const templateInfo: getTemplateDto = { templateName: 'test' };
      (require('./email_storage.service').getFile as jest.Mock).mockRejectedValue(new Error('File not found'));

      const result = await service.getTemplate(templateInfo);

      expect(result).toEqual({
        status_code: HttpStatus.NOT_FOUND,
        message: 'Template not found',
      });
    });
  });
});
