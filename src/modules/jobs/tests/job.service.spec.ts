import { Test, TestingModule } from '@nestjs/testing';
import { JobsService } from '../jobs.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { User, UserType } from '../../user/entities/user.entity';
import { Job } from '../entities/job.entity';
import { Repository } from 'typeorm';
import { NotFoundException, UnauthorizedException } from '@nestjs/common';
import { JobDto } from '../dto/job.dto';
import { PaginationDto } from '../dto/pagination.dto';

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
    invites: [],
    profile: null,
    testimonials: [],
    organisationMembers: [],
    jobs: [],
    created_at: new Date(),
    updated_at: new Date(),
    hashPassword: () => null,
  };

  const mockJob: Job = {
    id: 'job1',
    title: 'Software Engineer',
    description: 'We are looking for a skilled software engineer',
    location: 'Remote',
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
        location: 'Remote',
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

  describe('findAll', () => {
    it('should return paginated job listings', async () => {
      const paginationDto: PaginationDto = { page: 1, size: 10 };
      const mockJobs = [mockJob, { ...mockJob, id: 'job2' }];

      jest.spyOn(jobRepository, 'findAndCount').mockResolvedValue([mockJobs, 2]);

      const result = await service.findAll(paginationDto);

      expect(result.status).toBe('success');
      expect(result.status_code).toBe(200);
      expect(result.message).toBe('Job listings retrieved successfully.');
      expect(result.data).toHaveLength(2);
      expect(result.pagination).toEqual({
        current_page: 1,
        total_pages: 1,
        page_size: 10,
        total_items: 2,
      });
    });
  });

  describe('updateJob', () => {
    const updateJobDto: JobDto = {
      title: 'Updated Software Engineer',
      description: 'Updated description',
      location: 'New York',
      deadline: '2024-12-31',
      salary_range: '100k_to_150k',
      job_type: 'full-time',
      job_mode: 'onsite',
      company_name: 'New Tech Co',
    };

    it('should update a job successfully', async () => {
      jest.spyOn(userRepository, 'findOne').mockResolvedValue(mockUser);
      jest.spyOn(jobRepository, 'findOne').mockResolvedValue(mockJob);
      jest.spyOn(jobRepository, 'save').mockResolvedValue({ ...mockJob, ...updateJobDto });

      const result = await service.updateJob('job1', updateJobDto, 'user1');

      expect(result.message).toBe('Job details updated successfully');
      expect(result.status_code).toBe(200);
      expect(result.data).toEqual(expect.objectContaining(updateJobDto));
    });

    it('should throw NotFoundException if user is not found', async () => {
      jest.spyOn(userRepository, 'findOne').mockResolvedValue(null);

      await expect(service.updateJob('job1', updateJobDto, 'nonexistent')).rejects.toThrow(NotFoundException);
    });

    it('should throw NotFoundException if job is not found', async () => {
      jest.spyOn(userRepository, 'findOne').mockResolvedValue(mockUser);
      jest.spyOn(jobRepository, 'findOne').mockResolvedValue(null);

      await expect(service.updateJob('nonexistent', updateJobDto, 'user1')).rejects.toThrow(NotFoundException);
    });

    it('should throw UnauthorizedException if user is not the owner of the job', async () => {
      const differentUser = { ...mockUser, id: 'user2', hashPassword: () => null };
      jest.spyOn(userRepository, 'findOne').mockResolvedValue(differentUser);
      jest.spyOn(jobRepository, 'findOne').mockResolvedValue(mockJob);

      await expect(service.updateJob('job1', updateJobDto, 'user2')).rejects.toThrow(UnauthorizedException);
    });
  });
});
