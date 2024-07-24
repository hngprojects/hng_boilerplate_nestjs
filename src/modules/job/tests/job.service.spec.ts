import { Test, TestingModule } from '@nestjs/testing';
import { JobService } from '../job.service';
import { Repository } from 'typeorm';
import { Job } from '../entities/job.entity';
import { getRepositoryToken } from '@nestjs/typeorm';
import CreateNewJobOption from '../options/CreateNewJobOption';

// Mock repository
const mockJobRepository = {
  save: jest.fn(),
};

describe('JobService', () => {
  let service: JobService;
  let repository: Repository<Job>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        JobService,
        {
          provide: getRepositoryToken(Job),
          useValue: mockJobRepository,
        },
      ],
    }).compile();

    service = module.get<JobService>(JobService);
    repository = module.get<Repository<Job>>(getRepositoryToken(Job));
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('createJob', () => {
    it('should create a new job and save it', async () => {
      const jobData: CreateNewJobOption = {
        title: 'Software Engineer',
        description: 'Develop software applications',
        location: 'Remote',
        salary: '100000',
        job_type: 'Full-time',
        company_name: 'Tech Company',
      };

      const jobEntity = new Job();
      Object.assign(jobEntity, jobData);

      mockJobRepository.save.mockResolvedValue(jobEntity);

      const result = await service.createJob(jobData);

      expect(repository.save).toHaveBeenCalledWith(jobEntity);
      expect(result).toEqual(jobEntity);
    });
  });
});
