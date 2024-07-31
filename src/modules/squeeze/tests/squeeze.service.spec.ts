import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BadRequestException } from '@nestjs/common';
import { SqueezeService } from '../squeeze.service';
import { Squeeze } from '../entities/squeeze.entity';
import { SqueezeRequestDto } from '../dto/squeeze.dto';
import { CreateSqueezeMapper } from '../mapper/create-squeeze.mapper';
import { SqueezeMapper } from '../mapper/squeeze.mapper';

describe('SqueezeService', () => {
  let service: SqueezeService;
  let repository: Repository<Squeeze>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SqueezeService,
        {
          provide: getRepositoryToken(Squeeze),
          useClass: Repository,
        },
      ],
    }).compile();

    service = module.get<SqueezeService>(SqueezeService);
    repository = module.get<Repository<Squeeze>>(getRepositoryToken(Squeeze));
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
        id: '1',
        ...createSqueezeDto,
        created_at: new Date(),
        updated_at: new Date(),
      };

      const mappedResponse = {
        id: '1',
        ...createSqueezeDto,
        created_at: new Date(),
        updated_at: new Date(),
      };

      jest.spyOn(CreateSqueezeMapper, 'mapToEntity').mockReturnValue(mappedEntity);
      jest.spyOn(repository, 'create').mockReturnValue(savedEntity as Squeeze);
      jest.spyOn(repository, 'save').mockResolvedValue(savedEntity as Squeeze);
      jest.spyOn(SqueezeMapper, 'mapToResponseFormat').mockReturnValue(mappedResponse);

      const result = await service.create(createSqueezeDto);

      expect(CreateSqueezeMapper.mapToEntity).toHaveBeenCalledWith(createSqueezeDto);
      expect(repository.create).toHaveBeenCalledWith(mappedEntity);
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

      await expect(service.create(createSqueezeDto)).rejects.toThrow(
        new BadRequestException({
          message: 'Failed to submit your request',
          status_code: 400,
        })
      );

      expect(CreateSqueezeMapper.mapToEntity).toHaveBeenCalledWith(createSqueezeDto);
    });
  });
});
