import { Test, TestingModule } from '@nestjs/testing';
import { EmailService } from '../email.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { EmailTemplate } from '../entities/email-template.entity';
import { Repository } from 'typeorm';
import { NotFoundException, BadRequestException, InternalServerErrorException, HttpStatus } from '@nestjs/common';
import * as fs from 'fs';
import * as Handlebars from 'handlebars';
import { MailerService } from '@nestjs-modules/mailer';
import { SendEmailDto } from '../dto/email.dto';
import { Subject } from 'rxjs';

// jest.mock('fs', () => ({
//   promises: {
//     access: jest.fn(),
//   },
// }));

jest.mock('handlebars', () => ({
  compile: jest.fn().mockReturnValue(() => '<html></html>'),
}));

const mockEmailTemplateRepository = {
  create: jest.fn(),
  save: jest.fn(),
  findOne: jest.fn(),
  find: jest.fn(),
  count: jest.fn(),
  remove: jest.fn(),
  update: jest.fn(),
};

const mockMailerService = {
  sendMail: jest.fn().mockResolvedValue({}),
};

describe('EmailService', () => {
  let service: EmailService;
  let repository: Repository<EmailTemplate>;
  let mailerService: MailerService;

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        EmailService,
        {
          provide: MailerService,
          useValue: mockMailerService,
        },
        {
          provide: getRepositoryToken(EmailTemplate),
          useValue: mockEmailTemplateRepository,
        },
      ],
    }).compile();

    service = module.get<EmailService>(EmailService);
    mailerService = module.get<MailerService>(MailerService);
    repository = module.get<Repository<EmailTemplate>>(getRepositoryToken(EmailTemplate));
  });

  afterAll(() => {
    jest.resetModules();
  });

  afterEach(() => {
    jest.clearAllMocks();
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

  describe('createEmailTemplate', () => {
    it('should throw BadRequestException if template already exists', async () => {
      jest.spyOn(service, 'checkFileExists').mockResolvedValue(true);

      await expect(service.createEmailTemplate({ name: 'test', content: 'content', subject: 'subject'})).rejects.toThrow(BadRequestException);
    });

    it('should create a new email template', async () => {
      jest.spyOn(service, 'checkFileExists').mockResolvedValue(false);
      mockEmailTemplateRepository.create.mockReturnValue({ id: 'test-id' });
      mockEmailTemplateRepository.save.mockResolvedValue({ id: 'test-id' });

      const result = await service.createEmailTemplate({ name: 'test', content: 'content', subject: 'sasa' })

      expect(result).toEqual({
        status: 'success',
        message: 'Template created successfully',
        template: { id: 'test-id' },
      });
    });
  });

  describe('getEmailTemplate', () => {
    it('should throw NotFoundException if template does not exist', async () => {
      mockEmailTemplateRepository.findOne.mockResolvedValue(null);

      await expect(service.getEmailTemplate('invalid-id')).rejects.toThrow(NotFoundException);
    });

    it('should return the email template if it exists', async () => {
      const mockTemplate = { id: 'test-id', name: 'test' };
      mockEmailTemplateRepository.findOne.mockResolvedValue(mockTemplate);

      const result = await service.getEmailTemplate('test-id');

      expect(result).toEqual({
        status: 'success',
        message: 'Template retrieved successfully',
        template: mockTemplate,
      });
    });
  });

  describe('deleteEmailTemplate', () => {
    it('should throw NotFoundException if template does not exist', async () => {
      jest.spyOn(service, 'getEmailTemplate').mockRejectedValue(new NotFoundException('Template not found'));

      await expect(service.deleteEmailTemplate('invalid-id')).rejects.toThrow(NotFoundException);
    });

    it('should delete the email template if it exists', async () => {
      jest.spyOn(service, 'getEmailTemplate').mockResolvedValue({
        status: 'success',
        message: 'Template retrieved successfully',
        template: { id: 'test-id', name: 'test', subject: 'subject', content: '<h1></h1>',
          created_at: new Date(), updated_at: new Date()
        },
      });

      const result = await service.deleteEmailTemplate('test-id');

      expect(result).toEqual({
        status: 'success',
        message: 'Template deleted successfully',
      });
    });
  });

  describe('updateEmailTemplate', () => {
    it('should throw NotFoundException if template does not exist', async () => {
      jest.spyOn(service, 'getEmailTemplate').mockRejectedValue(new NotFoundException('Template not found'));

      await expect(service.updateEmailTemplate('invalid-id', { name: 'new-name', content: 'new-content', subject: 'aklass' })).rejects.toThrow(NotFoundException);
    });

    it('should throw BadRequestException if template name already exists', async () => {
      const mockTemplate = {
        id: 'test-id', name: 'test', content: 'content', subject: 'coidmals',
        created_at: new Date(), updated_at: new Date()
      };
      jest.spyOn(service, 'getEmailTemplate').mockResolvedValue({
        status: 'success',
        message: 'Template retrieved successfully',
        template: mockTemplate,
      });
      jest.spyOn(service, 'checkFileExists').mockResolvedValue(true);

      await expect(service.updateEmailTemplate('test-id', { name: 'new-name', content: 'new-content', subject: null})).rejects.toThrow(BadRequestException);
    });
  });
});