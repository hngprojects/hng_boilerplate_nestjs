import { Test, TestingModule } from '@nestjs/testing';
import { JobsService } from '../jobs.service';
import { JobDto } from '../dto/job.dto';
import { Repository } from 'typeorm';
import { Job } from '../entities/job.entity';
import UserResponseDTO from '../../user/dto/user-response.dto';
import { User } from '../../user/entities/user.entity';
import { getRepositoryToken } from '@nestjs/typeorm';
import { jobsMock } from './mocks/jobs.mock';

describe('JobsService', () => {
  let service: JobsService;
  let jobRepository: Repository<Job>;
  let userRepository: Repository<User>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        JobsService,
        {
          provide: getRepositoryToken(Job),
          useValue: {
            find: jest.fn(),
            findBy: jest.fn(),
            findOne: jest.fn(),
            create: jest.fn(),
            save: jest.fn(),
            findOneBy: jest.fn(),
            update: jest.fn(),
          },
        },
        {
          provide: getRepositoryToken(User),
          useValue: {
            findBy: jest.fn(),
            findOne: jest.fn(),
            create: jest.fn(),
            save: jest.fn(),
            findOneBy: jest.fn(),
            update: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<JobsService>(JobsService);
    userRepository = module.get(getRepositoryToken(User));
    jobRepository = module.get(getRepositoryToken(Job));
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('createNewJob', () => {
    const userDto: UserResponseDTO = {
      id: 'user_id',
      email: 'test@example.com',
    };
    const createJobDto: JobDto = {
      title: 'Software Engineer II',
      description:
        'We are looking for a skilled Software Engineer to join our team. The ideal candidate will have experience in building high-performance applications.',
      location: 'New York, NY',
      deadline: '2024-12-31T23:59:59Z',
      salary_range: '70k_to_100k',
      job_type: 'full-time',
      job_mode: 'remote',
      company_name: 'Tech Innovators Inc.',
    };

    it('should create a new job successfully', async () => {
      jest.spyOn(userRepository, 'findOne').mockResolvedValue(userDto as User);
      jest.spyOn(jobRepository, 'create').mockReturnValue({ ...createJobDto, user: userDto } as Job);
      jest.spyOn(jobRepository, 'save').mockResolvedValue({ ...createJobDto } as Job);
      const result = await service.create(createJobDto, userDto.id);
      expect(result.status).toEqual('success');
      expect(result.message).toEqual('Job listing created successfully');
      expect(result.data).toEqual(createJobDto);
    });
  });

  describe('lists all jobs', () => {
    it('should returns all jobs', async () => {
      jest.spyOn(jobRepository, 'find').mockResolvedValue(jobsMock);
      const jobs = await service.getJobs();
      expect(jobs.message).toEqual('Jobs listing fetched successfully');
      expect(jobs.status_code).toEqual(200);
    });
  });
});
