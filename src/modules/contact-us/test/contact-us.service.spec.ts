import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { ContactUs } from '../entities/contact-us.entity';
import { MailerService } from '@nestjs-modules/mailer';
import { CreateContactDto } from '../dto/create-contact-us.dto';
import { ContactUsService } from '../contact-us.service';
import * as SYS_MSG from '../../../helpers/SystemMessages';
import { HttpStatus } from '@nestjs/common';

describe('ContactUsService', () => {
  let service: ContactUsService;
  let mockRepository: any;
  let mockMailerService: any;

  beforeEach(async () => {
    mockRepository = {
      create: jest.fn(),
      save: jest.fn(),
    };

    mockMailerService = {
      sendMail: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ContactUsService,
        {
          provide: getRepositoryToken(ContactUs),
          useValue: mockRepository,
        },
        {
          provide: MailerService,
          useValue: mockMailerService,
        },
      ],
    }).compile();

    service = module.get<ContactUsService>(ContactUsService);
  });

  describe('createContactMessage', () => {
    it('should create a contact message and send an email', async () => {
      const createContactDto: CreateContactDto = {
        name: 'John Doe',
        email: 'john@example.com',
        phone: 123456789,
        message: 'Test message',
      };

      mockRepository.create.mockReturnValue(createContactDto);
      mockRepository.save.mockResolvedValue(createContactDto);
      mockMailerService.sendMail.mockResolvedValue(undefined);

      const result = await service.createContactMessage(createContactDto);

      expect(mockRepository.create).toHaveBeenCalledWith(createContactDto);
      expect(mockRepository.save).toHaveBeenCalledWith(createContactDto);
      expect(mockMailerService.sendMail).toHaveBeenCalled();
      expect(result).toEqual({ message: SYS_MSG.INQUIRY_SENT, status_code: HttpStatus.CREATED });
    });
  });
});
