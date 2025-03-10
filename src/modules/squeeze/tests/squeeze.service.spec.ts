import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BadRequestException, HttpException } from '@nestjs/common';
import { SqueezeService } from '../squeeze.service';
import { Squeeze } from '../entities/squeeze.entity';
import { SqueezeRequestDto } from '../dto/squeeze.dto';
import { CreateSqueezeMapper } from '../mapper/create-squeeze.mapper';
import { SqueezeMapper } from '../mapper/squeeze.mapper';

describe('SqueezeService', () => {
  let service: SqueezeService;
  let repository: Repository<Squeeze>;

  const mockSqueezeRepository = {
    save: jest.fn(),
    findOne: jest.fn(),
    findAndCount: jest.fn(),
    count: jest.fn(),
    softDelete: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SqueezeService,
        {
          provide: getRepositoryToken(Squeeze),
          useClass: Repository,
          useValue: mockSqueezeRepository,
        },
      ],
    }).compile();

    service = module.get<SqueezeService>(SqueezeService);
    repository = module.get<Repository<Squeeze>>(getRepositoryToken(Squeeze));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a new squeeze successfully', async () => {
      const createSqueezeDto = {
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

      const mappedEntity = {
        id: '1',
        ...createSqueezeDto,
        created_at: new Date(),
        updated_at: new Date(),
      };
      const savedEntity = {
        ...mappedEntity,
      };
      const mappedResponse = {
        ...mappedEntity,
      };

      jest.spyOn(CreateSqueezeMapper, 'mapToEntity').mockReturnValue(mappedEntity);
      jest.spyOn(repository, 'findOne').mockReturnValue(null);
      jest.spyOn(repository, 'save').mockResolvedValue(savedEntity as Squeeze);
      jest.spyOn(SqueezeMapper, 'mapToResponseFormat').mockReturnValue(mappedResponse);

      const result = await service.create(createSqueezeDto);

      expect(CreateSqueezeMapper.mapToEntity).toHaveBeenCalledWith(createSqueezeDto);
      expect(repository.save).toHaveBeenCalledWith(savedEntity);
      expect(SqueezeMapper.mapToResponseFormat).toHaveBeenCalledWith(savedEntity);
      expect(result).toEqual({
        status: 'success',
        message: 'Your request has been received. You will get a template shortly.',
        data: mappedResponse,
      });
    });

    it('should throw a BadRequestException if there is an error', async () => {
      const createSqueezeDto: SqueezeRequestDto = {
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

      jest.spyOn(CreateSqueezeMapper, 'mapToEntity').mockImplementation(() => {
        throw new Error('Mapping error');
      });

      await expect(service.create(createSqueezeDto)).rejects.toThrow(HttpException);
    });
  });

  describe('deleteSqueeze', () => {
    it('should delete a squeeze', async () => {
      const squeezeId = '1';
      const authenticatedSqueezeId = '1';
      const squeezeToDelete = { id: squeezeId, email: 'user@example.com' };

      mockSqueezeRepository.findOne.mockResolvedValueOnce(squeezeToDelete);
      mockSqueezeRepository.softDelete.mockResolvedValueOnce({ affected: 1 });

      const result = await service.deleteSqueeze(squeezeId, authenticatedSqueezeId);

      expect(result.status).toBe('success');
      expect(result.message).toBe('Deletion in progress');
      expect(mockSqueezeRepository.findOne).toHaveBeenCalledWith({ where: { id: squeezeId } });
      expect(mockSqueezeRepository.softDelete).toHaveBeenCalledWith(squeezeId);
    });

    it('should throw an error if squeeze is not found', async () => {
      const squeezeId = '1';
      const authenticatedSqueezeId = '1';

      mockSqueezeRepository.findOne.mockResolvedValueOnce(null);

      await expect(service.deleteSqueeze(squeezeId, authenticatedSqueezeId)).rejects.toThrow(HttpException);
    });

    it('should throw an error if the user is not authorized to delete the squeeze', async () => {
      const squeezeId = '1';
      const authenticatedSqueezeId = '2';
      const squeezeToDelete = { id: squeezeId, email: 'user@example.com' };

      mockSqueezeRepository.findOne.mockResolvedValueOnce(squeezeToDelete);

      await expect(service.deleteSqueeze(squeezeId, authenticatedSqueezeId)).rejects.toThrow(HttpException);
    });
  });
});
