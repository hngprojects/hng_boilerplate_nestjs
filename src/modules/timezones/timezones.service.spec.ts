import { Test, TestingModule } from '@nestjs/testing';
import { TimezonesService } from './timezones.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Timezone } from './entities/timezone.entity';
import { NotFoundException } from '@nestjs/common';

const mockTimezoneRepository = {
  findOne: jest.fn(),
  create: jest.fn(),
  save: jest.fn(),
  find: jest.fn(),
};

describe('TimezonesService', () => {
  let service: TimezonesService;
  let repository: Repository<Timezone>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TimezonesService,
        {
          provide: getRepositoryToken(Timezone),
          useValue: mockTimezoneRepository,
        },
      ],
    }).compile();

    service = module.get<TimezonesService>(TimezonesService);
    repository = module.get<Repository<Timezone>>(getRepositoryToken(Timezone));
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});

describe('TimezonesService - deleteTimezone', () => {
  let service: TimezonesService;
  let timezoneRepository: Repository<Timezone>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TimezonesService,
        {
          provide: getRepositoryToken(Timezone),
          useClass: Repository,
        },
      ],
    }).compile();

    service = module.get<TimezonesService>(TimezonesService);
    timezoneRepository = module.get<Repository<Timezone>>(getRepositoryToken(Timezone));
  });

  it('should successfully delete a timezone', async () => {
    const mockId = '123';

    const mockTimezone: Timezone = {
      id: '123',
      timezone: 'UTC',
      gmtOffset: '0',
      description: 'Coordinated Universal Time',
      created_at: new Date(),
      updated_at: new Date(),
    };
    jest.spyOn(timezoneRepository, 'findOne').mockResolvedValue(mockTimezone);
    jest.spyOn(timezoneRepository, 'delete').mockResolvedValue({ affected: 1 } as any);

    const result = await service.deleteTimezone(mockId);

    expect(result).toEqual({
      status_code: 200,
      message: 'Timezone deleted successfully',
    });
  });

  it('should throw NotFoundException if timezone is not found', async () => {
    jest.spyOn(timezoneRepository, 'findOne').mockResolvedValue(null);

    await expect(service.deleteTimezone('invalid-id')).rejects.toThrow(NotFoundException);
  });
});
