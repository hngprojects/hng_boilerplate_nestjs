import { Test, TestingModule } from '@nestjs/testing';
import { JobController } from './job.controller';
import { JobService } from './job.service';

describe('JobController', () => {
  let jobController: JobController;
  let jobService: JobService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [JobController],
      providers: [
        {
          provide: JobService,
          useValue: {
            findAll: jest.fn().mockResolvedValue({
              message: "Job listings retrieved successfully.",
              data: [
                {
                  title: "Software Engineer",
                  description: "Develop software applications",
                  location: "Remote",
                  salary: "$100k",
                  job_type: "Full-time"
                }
              ],
              pagination: {
                current_page: 1,
                total_pages: 1,
                page_size: 10,
                total_items: 1
              }
            })
          }
        }
      ]
    }).compile();

    jobController = module.get<JobController>(JobController);
    jobService = module.get<JobService>(JobService);
  });

  describe('getAllJobs', () => {
    it('should return a list of job listings with pagination', async () => {
      const result = await jobController.getAllJobs();

      expect(result).toEqual({
        message: "Job listings retrieved successfully.",
        data: [
          {
            title: "Software Engineer",
            description: "Develop software applications",
            location: "Remote",
            salary: "$100k",
            job_type: "Full-time"
          }
        ],
        pagination: {
          current_page: 1,
          total_pages: 1,
          page_size: 10,
          total_items: 1
        }
      });

      expect(jobService.findAll).toHaveBeenCalled();
    });
  });
});
