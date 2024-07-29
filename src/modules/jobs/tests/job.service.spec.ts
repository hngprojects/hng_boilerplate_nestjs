import { Test, TestingModule } from '@nestjs/testing';
import { JobsService } from '../jobs.service';
import { JobDto } from '../dto/job.dto';
import { Repository } from 'typeorm';
import { Job } from '../entities/job.entity';
import { User, UserType } from '../../user/entities/user.entity';
import { getRepositoryToken } from '@nestjs/typeorm';
import { NotFoundException } from '@nestjs/common';
import { PaginationDto } from '../dto/pagination.dto';

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
            findBy: jest.fn(),
            findOne: jest.fn(),
            create: jest.fn(),
            save: jest.fn(),
            findOneBy: jest.fn(),
            update: jest.fn(),
            findAndCount: jest.fn(),
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

  describe('create', () => {
    const userId = 'user_id';
    const createJobDto: JobDto = {
      title: 'Software Engineer II',
      description: 'We are looking for a skilled Software Engineer to join our team.',
      location: 'New York, NY',
      deadline: '2024-12-31T23:59:59Z',
      salary_range: '70k_to_100k',
      job_type: 'full-time',
      job_mode: 'remote',
      company_name: 'Tech Innovators Inc.',
    };

    it('should create a new job successfully', async () => {
      const user = { id: userId, email: 'test@example.com' };
      jest.spyOn(userRepository, 'findOne').mockResolvedValue(user as User);
      jest.spyOn(jobRepository, 'create').mockReturnValue({ ...createJobDto, user } as Job);
      jest.spyOn(jobRepository, 'save').mockResolvedValue({ ...createJobDto, id: 'job_id' } as Job);

      const result = await service.create(createJobDto, userId);

      expect(result.status).toEqual('success');
      expect(result.status_code).toEqual(201);
      expect(result.message).toEqual('Job listing created successfully');
      expect(result.data).toEqual(expect.objectContaining(createJobDto));
    });

    it('should throw NotFoundException if user is not found', async () => {
      jest.spyOn(userRepository, 'findOne').mockResolvedValue(null);

      await expect(service.create(createJobDto, userId)).rejects.toThrow(NotFoundException);
    });
  });

  describe('findAll', () => {
    it('should return paginated job listings', async () => {
      const paginationDto: PaginationDto = { page: 1, size: 10 };
      const mockJobs = [
        {
          id: 'job1',
          title: 'Senior Software Engineer',
          description: 'We are seeking an experienced software engineer to lead our backend team.',
          location: 'San Francisco, CA',
          deadline: '2024-12-31T23:59:59Z',
          salary_range: '100k_to_150k',
          job_type: 'full-time',
          job_mode: 'hybrid',
          company_name: 'TechCorp Inc.',
          is_deleted: false,
          created_at: new Date('2023-06-01T10:00:00Z'),
          updated_at: new Date('2023-06-01T10:00:00Z'),
          user: {
            id: 'user1',
            first_name: 'John',
            last_name: 'Doe',
            email: 'john.doe@example.com',
            password: 'hashed_password_1', // In real scenario, this would be a bcrypt hashed password
            is_active: true,
            attempts_left: 3,
            time_left: null,
            secret: 'some_2fa_secret',
            is_2fa_enabled: false,
            user_type: UserType.USER,
            hashPassword: () => null,
            owned_organisations: [], // IDs of owned organisations
            created_organisations: [], // IDs of created organisations
            products: [], // IDs of products
            invites: [], // IDs of invites
            testimonials: [], // IDs of testimonials
            jobs: [], // IDs of jobs
            created_at: new Date('2023-01-01T00:00:00Z'),
            updated_at: new Date('2023-01-01T00:00:00Z'),
          },
        },
        {
          id: 'job2',
          title: 'UX Designer',
          description: 'Join our creative team to design intuitive user experiences for our products.',
          location: 'New York, NY',
          deadline: '2024-11-30T23:59:59Z',
          salary_range: '70k_to_100k',
          job_type: 'full-time',
          job_mode: 'remote',
          company_name: 'DesignPro LLC',
          is_deleted: false,
          created_at: new Date('2023-06-02T09:30:00Z'),
          updated_at: new Date('2023-06-02T09:30:00Z'),
          user: {
            id: 'user1',
            first_name: 'John',
            last_name: 'Doe',
            email: 'john.doe@example.com',
            password: 'hashed_password_1', // In real scenario, this would be a bcrypt hashed password
            is_active: true,
            attempts_left: 3,
            time_left: null,
            secret: 'some_2fa_secret',
            is_2fa_enabled: false,
            user_type: UserType.USER,
            owned_organisations: [], // IDs of owned organisations
            created_organisations: [], // IDs of created organisations
            products: [], // IDs of products
            hashPassword: () => null,
            invites: [], // IDs of invites
            testimonials: [], // IDs of testimonials
            jobs: [], // IDs of jobs
            created_at: new Date('2023-01-01T00:00:00Z'),
            updated_at: new Date('2023-01-01T00:00:00Z'),
          },
        },
        {
          id: 'job3',
          title: 'Data Science Intern',
          description: 'Exciting opportunity for a data science student to gain hands-on experience.',
          location: 'Boston, MA',
          deadline: '2024-09-15T23:59:59Z',
          salary_range: '30k_to_50k',
          job_type: 'internship',
          job_mode: 'onsite',
          company_name: 'DataMinds Analytics',
          is_deleted: false,
          created_at: new Date('2023-06-03T11:15:00Z'),
          updated_at: new Date('2023-06-03T11:15:00Z'),
          user: {
            id: 'user1',
            first_name: 'John',
            last_name: 'Doe',
            email: 'john.doe@example.com',
            password: 'hashed_password_1', // In real scenario, this would be a bcrypt hashed password
            is_active: true,
            attempts_left: 3,
            time_left: null,
            secret: 'some_2fa_secret',
            hashPassword: () => null,
            is_2fa_enabled: false,
            user_type: UserType.USER,
            owned_organisations: [], // IDs of owned organisations
            created_organisations: [], // IDs of created organisations
            products: [], // IDs of products
            invites: [], // IDs of invites
            testimonials: [], // IDs of testimonials
            jobs: [], // IDs of jobs
            created_at: new Date('2023-01-01T00:00:00Z'),
            updated_at: new Date('2023-01-01T00:00:00Z'),
          },
        },
      ];
      jest.spyOn(jobRepository, 'findAndCount').mockResolvedValue([mockJobs, 2]);

      const result = await service.findAll(paginationDto);

      expect(result.status).toEqual('success');
      expect(result.status_code).toEqual(200);
      expect(result.message).toEqual('Job listings retrieved successfully.');
      console.log(result.data);
      expect(result.data).toEqual(mockJobs);
      expect(result.pagination).toEqual({
        current_page: 1,
        total_pages: 1,
        page_size: 10,
        total_items: 2,
      });
    });
  });

  describe('updateJob', () => {
    const jobId = 'job_id';
    const userId = 'user_id';
    const updateJobDto: JobDto = {
      title: 'Updated Software Engineer II',
      description: 'Updated job description',
      location: 'Remote',
      deadline: '2025-12-31T23:59:59Z',
      salary_range: '80k_to_120k',
      job_type: 'full-time',
      job_mode: 'remote',
      company_name: 'Tech Innovators Inc.',
    };

    it('should update a job successfully', async () => {
      const user = { id: userId, email: 'test@example.com' };
      const job = { id: jobId, ...updateJobDto };
      jest.spyOn(userRepository, 'findOne').mockResolvedValue(user as User);
      jest.spyOn(jobRepository, 'findOne').mockResolvedValue(job as Job);
      jest.spyOn(jobRepository, 'save').mockResolvedValue(job as Job);

      const result = await service.updateJob(jobId, updateJobDto, userId);

      expect(result.message).toEqual('Job details updated successfully');
      expect(result.status_code).toEqual(200);
      expect(result.data).toEqual(job);
    });

    it('should throw NotFoundException if user is not found', async () => {
      jest.spyOn(userRepository, 'findOne').mockResolvedValue(null);

      await expect(service.updateJob(jobId, updateJobDto, userId)).rejects.toThrow(NotFoundException);
    });

    it('should throw NotFoundException if job is not found', async () => {
      jest.spyOn(userRepository, 'findOne').mockResolvedValue({ id: userId } as User);
      jest.spyOn(jobRepository, 'findOne').mockResolvedValue(null);

      await expect(service.updateJob(jobId, updateJobDto, userId)).rejects.toThrow(NotFoundException);
    });
  });
});
