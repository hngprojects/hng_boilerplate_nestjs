import { Test, TestingModule } from '@nestjs/testing';
import { SqueezeService } from './squeeze.service';
import { Repository } from 'typeorm';
import { Squeeze } from './entities/squeeze.entity';
import { getRepositoryToken } from '@nestjs/typeorm';
import { CreateSqueezeDto } from './dto/create-squeeze.dto';

const mockSqueezeRepository = {
  create: jest.fn(),
  save: jest.fn(),
};

describe('SqueezeService', () => {
  let service: SqueezeService;
  let repository: Repository<Squeeze>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [SqueezeService, { provide: getRepositoryToken(Squeeze), useValue: mockSqueezeRepository }],
    }).compile();

    service = module.get<SqueezeService>(SqueezeService);
    repository = module.get<Repository<Squeeze>>(getRepositoryToken(Squeeze));
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should successfully insert a squeeze record', async () => {
      const createSqueezeDto: CreateSqueezeDto = {
        email: 'user@example.com',
        first_name: 'John',
        last_name: 'Doe',
        phone: '08098761234',
        location: 'Lagos, Nigeria',
        job_title: 'Software Engineer',
        company: 'X-Corp',
        interests: ['Web Development', 'Cloud Computing'],
        referral_source: 'LinkedIn',
      };

      const squeeze = {
        id: 'b0337a38-45ec-43e9-87ff-b85af31dcca5',
        ...createSqueezeDto,
      };

      mockSqueezeRepository.create.mockReturnValue(squeeze);
      mockSqueezeRepository.save.mockResolvedValue(squeeze);

      expect(mockSqueezeRepository.create).not.toHaveBeenCalled();
      expect(mockSqueezeRepository.save).not.toHaveBeenCalled();

      const result = await service.create(createSqueezeDto);

      expect(mockSqueezeRepository.create).toHaveBeenCalledWith(createSqueezeDto);
      expect(mockSqueezeRepository.save).toHaveBeenCalledWith(squeeze);
      expect(result).toEqual(squeeze);
    });
  });
});
