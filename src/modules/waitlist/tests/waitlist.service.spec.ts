import { Test, TestingModule } from '@nestjs/testing';
import { WaitlistService } from '../waitlist.service';
import { getRepositoryToken, TypeOrmModule } from '@nestjs/typeorm';
import { Waitlist } from '../waitlist.entity';
import { CreateWaitlistUserDto } from '../dto/create-waitlist-user.dto';
import { MailerModule, MailerService } from '@nestjs-modules/mailer';
import { EmailService } from '../../email/email.service';

describe('WaitlistService', () => {
  let service: WaitlistService;
  let emailService: EmailService;
  let mailerService: MailerService;
  const mockWaitlistRepository = {
    save: jest.fn(),
    findOne: jest.fn(),
    create: jest.fn(),
  };
  const mockMailerService = {
    sendMail: jest.fn().mockResolvedValue({}),
  };
  const mockEmailService = {
    sendConfirmationEmail: jest.fn().mockResolvedValue({}),
  };
  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        WaitlistService,
        EmailService,
        {
          provide: getRepositoryToken(Waitlist),
          useValue: mockWaitlistRepository,
        },
        {
          provide: MailerService,
          useValue: mockMailerService,
        },
      ],
    }).compile();

    service = module.get<WaitlistService>(WaitlistService);
    emailService = module.get<EmailService>(EmailService);
    mailerService = module.get<MailerService>(MailerService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should create a waitlist entry', async () => {
    const data: CreateWaitlistUserDto = {
      email: 'test@example.com',
      fullName: 'Test User',
    };
    mockWaitlistRepository.create.mockReturnValue(data);
    mockWaitlistRepository.save.mockResolvedValue(data);
    expect(mockWaitlistRepository.save).toHaveBeenCalledWith(expect.objectContaining(data));
  });
});
