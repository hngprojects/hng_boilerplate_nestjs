import { Repository } from 'typeorm';
import { Waitlist } from '../entities/waitlist.entity';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { MailerService } from '@nestjs-modules/mailer';
import { CreateWaitlistDto } from '../dto/create-waitlist.dto';
import { WaitlistResponseDto } from '../dto/create-waitlist-response.dto';
import WaitlistService from '../waitlist.service';
import { HttpStatus } from '@nestjs/common';

describe('WaitlistService', () => {
  let waitlistRepository: Repository<Waitlist>;
  let mailerService: MailerService;
  let waitlistService: WaitlistService;

  const mockWaitlistRepository = {
    find: jest.fn(),
    findAndCount: jest.fn(),
    save: jest.fn(),
    create: jest.fn(),
    findOne: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        WaitlistService,
        { provide: getRepositoryToken(Waitlist), useValue: mockWaitlistRepository },
        {
          provide: MailerService,
          useValue: {
            sendMail: jest.fn(),
          },
        },
      ],
    }).compile();

    waitlistService = module.get<WaitlistService>(WaitlistService);
    waitlistRepository = module.get<Repository<Waitlist>>(getRepositoryToken(Waitlist));
    mailerService = module.get<MailerService>(MailerService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(waitlistService).toBeDefined();
  });

  describe('getAllWaitlist', () => {
    it('should return paginated waitlist results with default values when no parameters are provided', async () => {
      // Arrange: setup default values (page = 1, limit = 10)
      const mockWaitlistEntries = [
        { id: '1', full_name: 'Alice', email: 'alice@example.com' },
        { id: '2', full_name: 'Bob', email: 'bob@example.com' },
      ];
      const totalCount = 2;
      mockWaitlistRepository.findAndCount = jest.fn().mockResolvedValue([mockWaitlistEntries, totalCount]);

      // Act: call service without pagination parameters
      const result = await waitlistService.getAllWaitlist();

      // Assert: defaults (skip: 0, take: 10) should be used
      expect(mockWaitlistRepository.findAndCount).toHaveBeenCalledWith({
        skip: 0,
        take: 10,
      });
      expect(result).toEqual({
        status: 'Success',
        status_code: 200,
        data: {
          current_page: 1,
          total_pages: 1, // since totalCount is 2 and default limit is 10
          total_waitlist_count: totalCount,
          waitlist: mockWaitlistEntries,
        },
        message: 'Waitlist found successfully',
      });
    });

    it('should return paginated waitlist results with provided page and limit', async () => {
      // Arrange: setup custom pagination values
      const mockWaitlistEntries = [
        { id: '3', full_name: 'Charlie', email: 'charlie@example.com' },
        { id: '4', full_name: 'David', email: 'david@example.com' },
      ];
      const totalCount = 20;
      mockWaitlistRepository.findAndCount = jest.fn().mockResolvedValue([mockWaitlistEntries, totalCount]);

      const page = 2;
      const limit = 5;

      // Act: call service with page and limit parameters
      const result = await waitlistService.getAllWaitlist(page, limit);

      // Assert: ensure proper skip and take values
      expect(mockWaitlistRepository.findAndCount).toHaveBeenCalledWith({
        skip: (page - 1) * limit, // (2-1)*5 = 5
        take: limit, // 5
      });
      expect(result).toEqual({
        status: 'Success',
        status_code: 200,
        data: {
          current_page: page, // e.g., 2
          total_pages: Math.ceil(totalCount / limit), // e.g., 4 if totalCount is 20 and limit is 5
          total_waitlist_count: totalCount,
          waitlist: mockWaitlistEntries,
        },
        message: 'Waitlist found successfully',
      });
    });
  });

  describe('createWaitlist', () => {
    it('should create a waitlist entry and send a confirmation email', async () => {
      const createWaitlistDto: CreateWaitlistDto = {
        full_name: 'John Doe',
        email: 'johndoe@gmail.com',
      };

      const findOneSpy = jest.spyOn(waitlistRepository, 'findOne').mockResolvedValue(null);
      const saveSpy = jest.spyOn(waitlistRepository, 'save').mockResolvedValue(undefined);
      const sendMailSpy = jest.spyOn(mailerService, 'sendMail').mockResolvedValue(undefined);

      const result: WaitlistResponseDto = await waitlistService.createWaitlist(createWaitlistDto);

      expect(findOneSpy).toHaveBeenCalledWith({ where: { email: createWaitlistDto.email } });
      expect(saveSpy).toHaveBeenCalled();
      expect(sendMailSpy).toHaveBeenCalledWith({
        to: createWaitlistDto.email,
        subject: 'Waitlist Confirmation',
        template: 'waitlist-confirmation',
        context: { recipientName: createWaitlistDto.full_name },
      });
      expect(result).toEqual({ message: 'You are all signed up!' });
    });

    it('should return 400 Bad Request for invalid data', async () => {
      const createWaitlistDto: CreateWaitlistDto = {
        full_name: '',
        email: 'invalid-email',
      };

      try {
        await waitlistService.createWaitlist(createWaitlistDto);
      } catch (e) {
        expect(e.response).toEqual({
          status_code: HttpStatus.BAD_REQUEST,
          message: ['Name should not be empty', 'Email must be an email'],
        });
      }
    });
  });
});
