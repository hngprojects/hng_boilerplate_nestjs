import { Test, TestingModule } from '@nestjs/testing';
import { WaitlistService } from '../waitlist.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Waitlist } from '../waitlist.entity';
import { CreateWaitlistUserDto } from '../dto/create-waitlist-user.dto';
import { EmailService } from '../../email/email.service';
import { HttpStatus } from '@nestjs/common';

describe('WaitlistService', () => {
  let service: WaitlistService;
  let emailService: EmailService;

  const mockWaitlistRepository = {
    save: jest.fn(),
    findOne: jest.fn(),
    create: jest.fn(),
  };

  const mockEmailService = {
    sendWaitListMail: jest.fn().mockResolvedValue({}),
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

    service = module.get<WaitlistService>(WaitlistService);
    emailService = module.get<EmailService>(EmailService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should return conflict if email exists', async () => {
    const data: CreateWaitlistUserDto = {
      email: 'test@example.com',
      fullName: 'Test User',
    };

    mockWaitlistRepository.findOne.mockResolvedValue(data);

    const result = await service.create(data);

    expect(result).toEqual({
      status_code: HttpStatus.CONFLICT,
      message: 'Duplicate email',
    });
  });

  it('should create a waitlist entry if email does not exist', async () => {
    const data: CreateWaitlistUserDto = {
      email: 'test@example.com',
      fullName: 'Test User',
    };

    const waitlistEntry = { ...data, id: 1, createdAt: new Date() };

    mockWaitlistRepository.findOne.mockResolvedValue(null);
    mockWaitlistRepository.create.mockReturnValue(waitlistEntry);
    mockWaitlistRepository.save.mockResolvedValue(waitlistEntry);

    const result = await service.create(data);

    expect(mockWaitlistRepository.create).toHaveBeenCalledWith(data);
    expect(mockWaitlistRepository.save).toHaveBeenCalledWith(waitlistEntry);
    expect(mockEmailService.sendWaitListMail).toHaveBeenCalledWith(data.email, process.env.CLIENT_URL);
    expect(result).toEqual({
      status_code: HttpStatus.CREATED,
      message: 'You are signed up successfully',
      user: waitlistEntry,
      providers: [WaitlistService, { provide: getRepositoryToken(Waitlist), useValue: mockUserRepository }],
    }).compile();

    waitlistService = module.get<WaitlistService>(WaitlistService);
    waitlistRepository = module.get<Repository<Waitlist>>(getRepositoryToken(Waitlist));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('getAllWaitlist', () => {
    it('should return all waitlist', async () => {
      await waitlistService.getAllWaitlist();

      expect(waitlistRepository.find).toHaveBeenCalled();
    });
  });
});
