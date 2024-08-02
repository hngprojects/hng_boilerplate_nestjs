import { Test, TestingModule } from '@nestjs/testing';
import { SqueezeService } from './squeeze.service';
import { Repository } from 'typeorm';
import { Squeeze } from './entities/squeeze.entity';
import { getRepositoryToken } from '@nestjs/typeorm';
import { UpdateSqueezeDto } from './dto/update-squeeze.dto';

const mockSqueezeRepository = {
  findOneBy: jest.fn(),
  save: jest.fn(),
};

describe('SqueezeService', () => {
  let service: SqueezeService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SqueezeService,
        {
          provide: getRepositoryToken(Squeeze),
          useValue: mockSqueezeRepository,
        },
      ],
    }).compile();

    service = module.get<SqueezeService>(SqueezeService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('updateSqueeze', async () => {
    const squeezeDto: UpdateSqueezeDto = {
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
      ...squeezeDto,
    };

    const updateSqueeze = {
      ...squeeze,
      phone: '0123456789',
    };

    mockSqueezeRepository.findOneBy.mockResolvedValue(squeeze);
    mockSqueezeRepository.save.mockResolvedValue(updateSqueeze);

    expect(mockSqueezeRepository.findOneBy).not.toHaveBeenCalled();
    expect(mockSqueezeRepository.save).not.toHaveBeenCalled();

    const result = await service.updateSqueeze(updateSqueeze);

    expect(mockSqueezeRepository.findOneBy).toHaveBeenCalled();
    expect(mockSqueezeRepository.save).toHaveBeenCalledWith(updateSqueeze);
    expect(result).toBe(updateSqueeze);
  });

  it('isInstanceOfAny', () => {
    class Class1 {
      name: string;
    }
    class Class2 {
      school: string;
    }

    class Class3 {
      course: string;
    }

    expect(service.isInstanceOfAny(new Class3(), [Class1, Class2])).toBe(false);
  });
});
