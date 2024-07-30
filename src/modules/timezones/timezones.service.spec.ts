import { Test, TestingModule } from '@nestjs/testing';
import { TimezonesService } from './timezones.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Timezone } from './entities/timezone.entity';

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
