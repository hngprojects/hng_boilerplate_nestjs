// jobs.service.spec.ts
import { Test, TestingModule } from '@nestjs/testing';
import { JobsService } from './jobs.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Job } from './job-listing.entity';
import { User } from './user.entity';
import { NotFoundException } from '@nestjs/common';

const mockJobRepository = {
  create: jest.fn().mockImplementation(dto => dto),
  save: jest.fn(),
  findOne: jest.fn(),
};

describe('JobsService', () => {
  let service: JobsService;
  let repository: Repository<Job>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        JobsService,
        {
          provide: getRepositoryToken(Job),
          useValue: mockJobRepository,
        },
      ],
    }).compile();

    service = module.get<JobsService>(JobsService);
    repository = module.get<Repository<Job>>(getRepositoryToken(Job));
  });

  const mockUser: User = {
    id: 'test-user-id',
    username: 'testuser',
    password: 'testpassword',
    jobs: [],
  };

  it('should create a job', async () => {
    const jobDto = {
      title: 'Test Job',
      description: 'Test Description',
      location: 'Test Location',
      salary: '1000',
      job_type: 'Full-Time',
      company_name: 'Test Company',
    };

    mockJobRepository.save.mockResolvedValue({ ...jobDto, user: mockUser });
    expect(await service.createJob(jobDto, mockUser)).toEqual({ ...jobDto, user: mockUser });
  });

  it('should update a job', async () => {
    const jobDto = {
      title: 'Updated Job',
      description: 'Updated Description',
    };

    const job = {
      id: 'test-job-id',
      title: 'Test Job',
      description: 'Test Description',
      location: 'Test Location',
      salary: '1000',
      job_type: 'Full-Time',
      company_name: 'Test Company',
      created_at: new Date(),
      updated_at: new Date(),
      user: mockUser,
    };

    mockJobRepository.findOne.mockResolvedValue(job);
    mockJobRepository.save.mockResolvedValue({ ...job, ...jobDto });

    expect(await service.updateJob('test-job-id', jobDto)).toEqual({ ...job, ...jobDto });
  });

  it('should throw an error if job not found', async () => {
    mockJobRepository.findOne.mockResolvedValue(null);

    await expect(service.updateJob('non-existent-id', {})).rejects.toThrow(NotFoundException);
  });

  it('should throw an error if the job does not belong to the user', async () => {
    const jobDto = {
      title: 'Updated Job',
      description: 'Updated Description',
    };

    const job = {
      id: 'test-job-id',
      title: 'Test Job',
      description: 'Test Description',
      location: 'Test Location',
      salary: '1000',
      job_type: 'Full-Time',
      company_name: 'Test Company',
      created_at: new Date(),
      updated_at: new Date(),
      user: { ...mockUser, id: 'another-user-id' },
    };

    mockJobRepository.findOne.mockResolvedValue(job);

    await expect(service.updateJob('test-job-id', jobDto)).rejects.toThrow(NotFoundException);
  });
});
