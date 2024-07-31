import { Repository } from 'typeorm';
import WaitlistService from '../waitlist.service';
import { Waitlist } from '../entities/waitlist.entity';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { AddToWaitlistRequestDto } from '../dto/add-to-waitlist-request.dto';

describe('WaitlistService', () => {
  let waitlistService: WaitlistService;
  let waitlistRepository: Repository<Waitlist>;

  const mockUserRepository = {
    save: jest.fn(),
    find: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [WaitlistService, { provide: getRepositoryToken(Waitlist), useValue: mockUserRepository }],
    }).compile();

    waitlistService = module.get<WaitlistService>(WaitlistService);
    waitlistRepository = module.get<Repository<Waitlist>>(getRepositoryToken(Waitlist));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('addToWaitlist', () => {
    it('should add to waitlist', async () => {
      const mockAddToWaitlistRequestDto: AddToWaitlistRequestDto = {
        email: 'user@test.com',
        name: 'Test User',
      };

      await waitlistService.addToWaitlist(mockAddToWaitlistRequestDto);

      expect(waitlistRepository.save).toHaveBeenCalledWith(mockAddToWaitlistRequestDto);
    });
  });

  describe('getAllWaitlist', () => {
    it('should return all waitlist', async () => {
      await waitlistService.getAllWaitlist();

      expect(waitlistRepository.find).toHaveBeenCalled();
    });
  });
});
