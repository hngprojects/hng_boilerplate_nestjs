import { Repository } from 'typeorm';
import WaitlistService from '../waitlist.service';
import { Waitlist } from '../entities/waitlist.entity';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';

describe('WaitlistService', () => {
  let waitlistService: WaitlistService;
  let waitlistRepository: Repository<Waitlist>;

  const mockUserRepository = {
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

  describe('getAllWaitlist', () => {
    it('should return all waitlist', async () => {
      await waitlistService.getAllWaitlist();

      expect(waitlistRepository.find).toHaveBeenCalled();
    });
  });
});
