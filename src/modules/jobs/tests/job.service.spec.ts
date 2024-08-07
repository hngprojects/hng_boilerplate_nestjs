import { Test, TestingModule } from '@nestjs/testing';
import { JobsService } from '../jobs.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { User, UserType } from '../../user/entities/user.entity';
import { Job } from '../entities/job.entity';
import { Repository } from 'typeorm';
import { NotFoundException, UnauthorizedException } from '@nestjs/common';
import { JobDto, JobMode, JobType, SalaryRange } from '../dto/job.dto';
import { PaginationDto } from '../dto/pagination.dto';
import { JobSearchDto } from '../dto/jobSearch.dto';

describe('JobsService', () => {
  let service: JobsService;
  let userRepository: Repository<User>;
  let jobRepository: Repository<Job>;

  const mockUser: User = {
    id: 'user1',
    first_name: 'John',
    last_name: 'Doe',
    email: 'john@example.com',
    password: 'hashedpassword',
    phone: '1234567890',
    is_active: true,
    attempts_left: 3,
    time_left: null,
    secret: 'secret',
    is_2fa_enabled: false,
    user_type: UserType.USER,
    owned_organisations: [],
    created_organisations: [],
    profile: null,
    testimonials: [],
    backup_codes: [],
    organisationMembers: [],
    jobs: [],
    created_at: new Date(),
    updated_at: new Date(),
    notification_settings: [],
    notifications: [],
    hashPassword: () => null,
  };

  const mockJob: Job = {
    id: 'job1',
    title: 'Software Engineer',
    description: 'We are looking for a skilled software engineer',
    location: 'Boston',
    deadline: '2023-12-31',
    salary_range: '70k_to_100k',
    job_type: 'full-time',
    job_mode: 'remote',
    company_name: 'Tech Co',
    is_deleted: false,
    user: mockUser,
    created_at: new Date(),
    updated_at: new Date(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        JobsService,
        {
          provide: getRepositoryToken(User),
          useClass: Repository,
        },
        {
          provide: getRepositoryToken(Job),
          useClass: Repository,
        },
      ],
    }).compile();

    service = module.get<JobsService>(JobsService);
    userRepository = module.get<Repository<User>>(getRepositoryToken(User));
    jobRepository = module.get<Repository<Job>>(getRepositoryToken(Job));
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a new job', async () => {
      const createJobDto: JobDto = {
        title: 'Software Engineer',
        description: 'We are looking for a skilled software engineer',
        location: 'Boston',
        deadline: '2023-12-31',
        salary_range: '70k_to_100k',
        job_type: 'full-time',
        job_mode: 'remote',
        company_name: 'Tech Co',
      };

      jest.spyOn(userRepository, 'findOne').mockResolvedValue(mockUser);
      jest.spyOn(jobRepository, 'create').mockReturnValue(mockJob);
      jest.spyOn(jobRepository, 'save').mockResolvedValue(mockJob);

      const result = await service.create(createJobDto, 'user1');

      expect(result.status).toBe('success');
      expect(result.status_code).toBe(201);
      expect(result.message).toBe('Job listing created successfully');
      expect(result.data).toEqual(expect.objectContaining(createJobDto));
    });

    it('should throw NotFoundException if user is not found', async () => {
      jest.spyOn(userRepository, 'findOne').mockResolvedValue(null);

      await expect(service.create({} as JobDto, 'nonexistent')).rejects.toThrow(NotFoundException);
    });
  });

  describe('searchJobs', () => {
    it('should return jobs based on search criteria', async () => {
      const searchDto: JobSearchDto = {
        location: 'Boston',
        salary_range: '70k_to_100k' as SalaryRange,
        job_type: 'full-time' as JobType,
        job_mode: 'remote' as JobMode,
      };
      const paginationDto: PaginationDto = { page: 1, size: 10 };

      jest.spyOn(jobRepository, 'createQueryBuilder').mockImplementation(() => {
        return {
          where: jest.fn().mockReturnThis(),
          andWhere: jest.fn().mockReturnThis(),
          getCount: jest.fn().mockResolvedValue(1),
          skip: jest.fn().mockReturnThis(),
          take: jest.fn().mockReturnThis(),
          getMany: jest.fn().mockResolvedValue([mockJob]),
        } as any;
      });

      const result = await service.searchJobs(searchDto, page, limit);

      expect(result.success).toBe(true);
      expect(result.data).toHaveLength(1);
      expect(result.pagination).toEqual({
        current_page: 1,
        per_page: 10,
        total_pages: 1,
        total_items: 1,
      });
    });

    it('should return empty array if no jobs match the criteria', async () => {
      const searchDto: JobSearchDto = {
        location: 'Nowhere',
        salary_range: '100k_to_150k' as SalaryRange,
        job_type: 'part-time' as JobType,
        job_mode: 'onsite' as JobMode,
      };
      const paginationDto: PaginationDto = { page: 1, size: 10 };

      jest.spyOn(jobRepository, 'createQueryBuilder').mockImplementation(() => {
        return {
          where: jest.fn().mockReturnThis(),
          andWhere: jest.fn().mockReturnThis(),
          getCount: jest.fn().mockResolvedValue(0),
          skip: jest.fn().mockReturnThis(),
          take: jest.fn().mockReturnThis(),
          getMany: jest.fn().mockResolvedValue([]),
        } as any;
      });

      const result = await service.searchJobs(searchDto, page, limit);

      expect(result.success).toBe(true);
      expect(result.data).toHaveLength(0);
      expect(result.pagination).toEqual({
        current_page: 1,
        per_page: 10,
        total_pages: 0,
        total_items: 0,
      });
    });

    it('should handle pagination correctly', async () => {
      const searchDto: JobSearchDto = {};
      const paginationDto: PaginationDto = { page: 2, size: 5 };

      jest.spyOn(jobRepository, 'createQueryBuilder').mockImplementation(() => {
        return {
          where: jest.fn().mockReturnThis(),
          andWhere: jest.fn().mockReturnThis(),
          getCount: jest.fn().mockResolvedValue(12),
          skip: jest.fn().mockReturnThis(),
          take: jest.fn().mockReturnThis(),
          getMany: jest.fn().mockResolvedValue([mockJob, mockJob]),
        } as any;
      });

      const result = await service.searchJobs(searchDto, page, limit);

      expect(result.success).toBe(true);
      expect(result.data).toHaveLength(2);
      expect(result.pagination).toEqual({
        current_page: 2,
        per_page: 5,
        total_pages: 3,
        total_items: 12,
      });
    });
  });
});
