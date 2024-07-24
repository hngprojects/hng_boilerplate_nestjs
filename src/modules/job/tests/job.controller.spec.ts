import { Test, TestingModule } from '@nestjs/testing';
import { JobController } from '../job.controller';
import { JobService } from '../job.service';
import { CreateJobDTO } from '../dto/create-job.dto';
import { HttpStatus } from '@nestjs/common';

describe('JobController', () => {
  let controller: JobController;
  let service: JobService;

  const mockJobService = {
    createJob: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [JobController],
      providers: [
        {
          provide: JobService,
          useValue: mockJobService,
        },
      ],
    }).compile();

    controller = module.get<JobController>(JobController);
    service = module.get<JobService>(JobService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('createNewJob', () => {
    it('should create a new job and return the response', async () => {
      const createJobDto: CreateJobDTO = {
        title: 'Software Engineer',
        description: 'Develop software applications',
        location: 'Remote',
        salary: '100000',
        job_type: 'Full-time',
        organisation: 'Tech Company',
      };

      const job = {
        ...createJobDto,
        id: 1,
      };

      mockJobService.createJob.mockResolvedValue(job);

      const result = await controller.createNewJob(createJobDto);

      expect(service.createJob).toHaveBeenCalledWith(createJobDto);
      expect(result).toEqual({
        message: 'Job Listing Created successfully',
        job,
      });
    });
  });
});
