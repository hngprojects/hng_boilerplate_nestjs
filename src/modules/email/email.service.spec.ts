import { Test, TestingModule } from '@nestjs/testing';
import { EmailService } from './email.service';
import { SendEmailDto, createTemplateDto, getTemplateDto } from './dto/email.dto';
import * as Handlebars from 'handlebars';
import * as htmlValidator from 'html-validator';
import * as fs from 'fs';
import { HttpStatus } from '@nestjs/common';
import { MailerService } from '@nestjs-modules/mailer';

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
  let mailerService: MailerService;

  const mockMailerService = {
    sendMail: jest.fn().mockResolvedValue({}),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        EmailService,
        {
          provide: MailerService,
          useValue: mockMailerService,
        },
      ],
    }).compile();

    service = module.get<EmailService>(EmailService);
    mailerService = module.get<MailerService>(MailerService);
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

    const result = await service.sendEmail(emailData);

    expect(mailerService.sendMail).toHaveBeenCalledWith(emailData);
    expect(result).toEqual({
      status_code: HttpStatus.OK,
      message: 'Email sent successfully',
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
});
