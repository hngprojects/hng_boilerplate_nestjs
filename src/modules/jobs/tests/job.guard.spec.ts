import { Test, TestingModule } from '@nestjs/testing';
import { ExecutionContext, ForbiddenException, NotFoundException } from '@nestjs/common';
import { JobGuard } from '../guards/job.guard';
import { Repository } from 'typeorm';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Job } from '../entities/job.entity';

describe('JobGuard', () => {
  let guard: JobGuard;
  let jobRepository: Repository<Job>;

  const mockJobRepository = {
    findOne: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        {
          provide: getRepositoryToken(Job),
          useValue: mockJobRepository,
        },
      ],
    }).compile();

    jobRepository = module.get<Repository<Job>>(getRepositoryToken(Job));
    guard = new JobGuard(jobRepository);
  });

  it('should allow access if the job belongs to the user', async () => {
    const mockJob = { id: '1', user: { id: 'user123' }, is_deleted: false } as Job;
    mockJobRepository.findOne.mockResolvedValue(mockJob);

    const mockContext = {
      switchToHttp: jest.fn().mockReturnValue({
        getRequest: jest.fn().mockReturnValue({
          user: { id: 'user123' },
          params: { id: 1 },
        }),
      }),
    } as unknown as ExecutionContext;

    const result = await guard.canActivate(mockContext);

    expect(result).toBe(true);
  });

  it('should throw NotFoundException if the job is deleted', async () => {
    const mockJob = { id: '1', user: { id: 'user123' }, is_deleted: true } as Job;
    mockJobRepository.findOne.mockResolvedValue(mockJob);

    const mockContext = {
      switchToHttp: jest.fn().mockReturnValue({
        getRequest: jest.fn().mockReturnValue({
          user: { id: 'user123' },
          params: { id: 1 },
        }),
      }),
    } as unknown as ExecutionContext;

    await expect(guard.canActivate(mockContext)).rejects.toThrow(NotFoundException);
  });

  it('should throw ForbiddenException if the job does not belong to the user', async () => {
    const mockJob = { id: '1', user: { id: 'user456' }, is_deleted: false } as Job;
    mockJobRepository.findOne.mockResolvedValue(mockJob);

    const mockContext = {
      switchToHttp: jest.fn().mockReturnValue({
        getRequest: jest.fn().mockReturnValue({
          user: { id: 'user123' },
          params: { id: 1 },
        }),
      }),
    } as unknown as ExecutionContext;

    await expect(guard.canActivate(mockContext)).rejects.toThrow(ForbiddenException);
  });

  it('should throw NotFoundException if the job is not found', async () => {
    const mockJob = { id: '1', user: { id: 'user456' }, is_deleted: true } as Job;
    mockJobRepository.findOne.mockResolvedValue(mockJob);

    const mockContext = {
      switchToHttp: jest.fn().mockReturnValue({
        getRequest: jest.fn().mockReturnValue({
          user: { id: 'user456' },
          params: { id: 1 },
        }),
      }),
    } as unknown as ExecutionContext;

    await expect(guard.canActivate(mockContext)).rejects.toThrow(NotFoundException);
  });
});
