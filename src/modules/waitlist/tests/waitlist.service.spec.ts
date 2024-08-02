import { Test, TestingModule } from '@nestjs/testing';
import { WaitlistService } from '../waitlist.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Waitlist } from '../waitlist.entity';
import { CreateWaitlistUserDto } from '../dto/create-waitlist-user.dto';
import { EmailService } from '../../email/email.service';
import { HttpStatus } from '@nestjs/common';
import { Repository } from 'typeorm';

describe('WaitlistService', () => {
  let waitlistService: WaitlistService;
  let emailService: EmailService;
  let waitlistRepository: Partial<Repository<Waitlist>>;

  const mockWaitlistRepository: Partial<Repository<Waitlist>> = {
    save: jest.fn(),
    findOne: jest.fn(),
    create: jest.fn(),
    find: jest.fn(),
  };

  const mockEmailService = {
    sendEmail: jest.fn().mockResolvedValue(void 0),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        WaitlistService,
        {
          provide: EmailService,
          useValue: mockEmailService,
        },
        {
          provide: getRepositoryToken(Waitlist),
          useValue: mockWaitlistRepository,
        },
      ],
    }).compile();

    waitlistService = module.get<WaitlistService>(WaitlistService);
    emailService = module.get<EmailService>(EmailService);
    waitlistRepository = module.get(getRepositoryToken(Waitlist));
  });

  it('should be defined', () => {
    expect(waitlistService).toBeDefined();
  });

  it('should return conflict if email exists', async () => {
    const data: CreateWaitlistUserDto = {
      to: 'test@example.com',
      fullName: 'Test User',
      context: {},
      subject: 'Test mail',
      template: '',
    };

    (waitlistRepository.findOne as jest.Mock).mockResolvedValue(data);

    const result = await waitlistService.create(data);

    expect(result).toEqual({
      status_code: HttpStatus.CONFLICT,
      message: 'Duplicate email',
    });
  });

  it('should create a waitlist entry if email does not exist', async () => {
    const data: CreateWaitlistUserDto = {
      to: 'test@example.com',
      fullName: 'Test User',
      context: {},
      subject: 'Test mail',
      template: '',
    };

    const waitlistEntry = { ...data, id: 1, createdAt: new Date() };

    (waitlistRepository.findOne as jest.Mock).mockResolvedValue(null);
    (waitlistRepository.create as jest.Mock).mockReturnValue(waitlistEntry);
    (waitlistRepository.save as jest.Mock).mockResolvedValue(waitlistEntry);

    const result = await waitlistService.create(data);

    expect(waitlistRepository.create).toHaveBeenCalledWith(data);
    expect(waitlistRepository.save).toHaveBeenCalledWith(waitlistEntry);
    expect(mockEmailService.sendEmail).toHaveBeenCalledWith(data);
    expect(result).toEqual({
      status_code: HttpStatus.CREATED,
      message: 'You are signed up successfully',
      user: waitlistEntry,
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('getAllWaitlist', () => {
    it('should return all waitlist', async () => {
      const waitlistEntries = [{ id: 1, to: 'test@example.com', fullName: 'Test User' }];

      (waitlistRepository.find as jest.Mock).mockResolvedValue(waitlistEntries);

      const result = await waitlistService.getAllWaitlist();

      expect(waitlistRepository.find).toHaveBeenCalled();
      expect(result.data.waitlist).toEqual(waitlistEntries);
    });
  });
});
