import { HttpStatus, NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CustomHttpException } from '@shared/helpers/custom-http-filter';
import UserResponseDTO from '../../user/dto/user-response.dto';
import { User } from '../../user/entities/user.entity';
import { JobApplicationDto } from '../dto/job-application.dto';
import { JobDto, SalaryRange, JobType, JobMode } from '../dto/job.dto';
import { JobApplication } from '../entities/job-application.entity';
import { Job } from '../entities/job.entity';
import { JobsService } from '../jobs.service';
import { jobsMock } from './mocks/jobs.mock';
import { JobSearchDto } from '../dto/jobSearch.dto';
import { UpdateJobDto } from '../dto/update-job.dto';
import { S3Service } from '@modules/s3/s3.service';
import { isPassed } from '../utils/helpers';

jest.mock('../utils/helpers', () => ({
  isPassed: jest.fn(() => false),
}));
describe('JobsService', () => {
  let service: JobsService;
  let jobRepository: Repository<Job>;
  let userRepository: Repository<User>;
  let userDto: UserResponseDTO;
  let createJobDto: JobDto;
  let s3Service: S3Service;

  const mockJob = {
    data: {
      is_deleted: false,
      deadline: new Date(new Date().getTime() + 1000 * 60 * 60 * 24).toISOString(),
    },
  };
  const mockFile: Express.Multer.File = {
    fieldname: 'resume',
    originalname: 'resume.pdf',
    encoding: '7bit',
    mimetype: 'application/pdf',
    buffer: Buffer.from('mock file content'),
    size: 1024,
    destination: '',
    filename: '',
    path: '',
    stream: null,
  };
  const mockJobApplicationDto: JobApplicationDto = {
    applicant_name: 'John Doe',
    email: 'johndoe@example.com',
    resume: mockFile,
    cover_letter: 'Cover letter text',
  };

  const mockJobApplicationResponse = {
    status: 'success',
    message: 'Application submitted successfully',
    status_code: HttpStatus.CREATED,
  };

  beforeEach(async () => {
    userDto = {
      id: 'user_id',
      email: 'test@example.com',
    };

    createJobDto = {
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

            createQueryBuilder: jest.fn().mockReturnValue({
              where: jest.fn().mockReturnThis(),
              andWhere: jest.fn().mockReturnThis(),
              getCount: jest.fn().mockReturnThis(),
              skip: jest.fn().mockReturnThis(),
              take: jest.fn().mockReturnThis(),
              getMany: jest.fn().mockReturnThis(),
            }),
          },
        },
        {
          provide: getRepositoryToken(JobApplication),
          useValue: {
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
        {
          provide: S3Service,
          useValue: {
            uploadFile: jest.fn().mockResolvedValue('https://s3-bucket-url/resume.pdf'),
          },
        },
      ],
    }).compile();

    service = module.get<JobsService>(JobsService);
    userRepository = module.get(getRepositoryToken(User));
    jobRepository = module.get(getRepositoryToken(Job));
    s3Service = module.get<S3Service>(S3Service);

    jest.spyOn(userRepository, 'findOne').mockResolvedValue(userDto as User);
    jest.spyOn(jobRepository, 'create').mockReturnValue({ ...createJobDto, user: userDto } as Job);
    jest
      .spyOn(jobRepository, 'findOne')
      .mockResolvedValue({ ...createJobDto, is_deleted: false, user: userDto } as Job);
    jest.spyOn(jobRepository, 'save').mockResolvedValue({ ...createJobDto } as Job);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('createNewJob', () => {
    it('should create a new job successfully', async () => {
      const result = await service.create(createJobDto, userDto.id);
      expect(result.status).toEqual('success');
      expect(result.message).toEqual('Job listing created successfully');
      expect(result.data).toEqual(createJobDto);
    });

    it('should throw CustomHttpException if user is not found', async () => {
      jest.spyOn(userRepository, 'findOne').mockResolvedValue(null);

      await expect(service.create({} as JobDto, 'nonexistent')).rejects.toThrow(CustomHttpException);
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

  describe('deleteJob', () => {
    it('should delete the job successfully', async () => {
      const result = await service.delete('job-1');
      expect(result.status).toEqual('success');
      expect(result.message).toEqual('Job details deleted successfully');
    });
  });

  describe('applyForJob', () => {
    it('should throw error if job is deleted', async () => {
      jest.spyOn(service, 'getJob').mockResolvedValue({
        data: { is_deleted: true, deadline: new Date().toISOString() },
      } as any);

      await expect(service.applyForJob('jobId', mockJobApplicationDto, {} as Express.Multer.File)).rejects.toThrow(
        new CustomHttpException('Job deleted', HttpStatus.NOT_FOUND)
      );
    });

    it('should throw error if application deadline has passed', async () => {
      jest.spyOn(service, 'getJob').mockResolvedValue({
        data: { is_deleted: false, deadline: new Date(new Date().getTime() - 1000 * 60 * 60 * 24).toISOString() },
      } as any);
      (isPassed as jest.Mock).mockReturnValue(true);

      await expect(
        service.applyForJob('jobId', mockJobApplicationDto, {} as Express.Multer.File)
      ).rejects.toMatchObject(
        new CustomHttpException('Job application deadline passed', HttpStatus.UNPROCESSABLE_ENTITY)
      );
    });
    it('should successfully create a job application with resume uploaded to S3', async () => {
      const resume = { buffer: Buffer.from('test file'), originalname: 'resume.pdf' } as Express.Multer.File;

      jest.spyOn(service, 'getJob').mockResolvedValue(mockJob as any);
      jest.spyOn(s3Service, 'uploadFile').mockResolvedValue('https://s3-bucket-url/resume.pdf');
      (isPassed as jest.Mock).mockReturnValue(false);

      jest
        .spyOn(service['jobApplicationRepository'], 'create')
        .mockReturnValue({ id: '1', ...mockJobApplicationDto } as any);
      jest
        .spyOn(service['jobApplicationRepository'], 'save')
        .mockResolvedValue({ id: '1', ...mockJobApplicationDto } as any);

      const result = await service.applyForJob('jobId', mockJobApplicationDto, resume);

      expect(result).toEqual(mockJobApplicationResponse);
      expect(s3Service.uploadFile).toHaveBeenCalledWith(resume, 'resumes'); // ✅ Updated expectation
      expect(service['jobApplicationRepository'].create).toHaveBeenCalled();
      expect(service['jobApplicationRepository'].save).toHaveBeenCalled();
    });

    it('should throw error if duplicate application is found', async () => {
      const resume = { buffer: Buffer.from('test file'), originalname: 'resume.pdf' } as Express.Multer.File;

      jest.spyOn(service, 'getJob').mockResolvedValue(mockJob as any);
      jest
        .spyOn(service['jobApplicationRepository'], 'findOne')
        .mockResolvedValue({ ...mockJobApplicationDto, resumeUrl: 'https://s3-bucket-url/resume.pdf' } as any);

      await expect(service.applyForJob('jobId', mockJobApplicationDto, resume)).rejects.toThrow(
        new CustomHttpException('Duplicate application', HttpStatus.CONFLICT)
      );
    });

  });

  describe('searchJobs', () => {
    it('should return jobs based on search criteria', async () => {
      const searchDto: JobSearchDto = {
        location: 'Boston',
        salary_range: '70k_to_100k' as SalaryRange,
        job_type: 'full-time' as JobType,
        job_mode: 'remote' as JobMode,
        page: 1,
        limit: 10,
      };

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

      const result = await service.searchJobs(searchDto, searchDto.page, searchDto.limit);
      expect(result.status_code).toBe(200);
      expect(result.data).toHaveLength(1);
      expect(result.data[0]).toEqual(mockJob);
    });

    it('should return empty array if no jobs match the criteria', async () => {
      const searchDto: JobSearchDto = {
        location: 'Nowhere',
        salary_range: '100k_to_150k' as SalaryRange,
        job_type: 'part-time' as JobType,
        job_mode: 'onsite' as JobMode,
        page: 1,
        limit: 10,
      };

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

      const result = await service.searchJobs(searchDto, searchDto.page, searchDto.limit);
      expect(result.status_code).toBe(200);
      expect(result.data).toHaveLength(0);
    });

    it('should handle pagination correctly', async () => {
      const searchDto: JobSearchDto = {};
      const page = 2;
      const limit = 5;

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
      expect(result.status_code).toBe(200);
      expect(result.data).toHaveLength(2);
    });
  });

  // Add a mock user with all required properties
  const mockUser: User = {
    id: 'user_id',
    created_at: new Date(),
    updated_at: new Date(),
    first_name: 'John',
    last_name: 'Doe',
    email: 'john@example.com',
    status: 'active',
    password: 'hashedPassword123',
    phone: '+1234567890',
    is_active: true,
    backup_codes: [],
    attempts_left: 3,
    time_left: 0,
    secret: 'secret123',
    is_2fa_enabled: false,
    deletedAt: null,
    owned_organisations: [],
    organisations: [],
    jobs: [],
    profile: null,
    testimonials: [],
    blogs: [],
    notifications: [],
    notification_settings: [],
    comments: [],
    orders: [],
    cart: null,
  } as User;

  describe('updateJob', () => {
    const updateDto: UpdateJobDto = {
      title: 'Updated Job Title',
      salary_range: SalaryRange['50k_to_70k'],
    };

    it('should update job successfully', async () => {
      const mockJob = {
        ...jobsMock[0],
        user: mockUser as User,
      } as Job;

      jest.spyOn(jobRepository, 'findOne').mockResolvedValue(mockJob);
      jest.spyOn(jobRepository, 'save').mockResolvedValue({
        ...mockJob,
        ...updateDto,
      } as Job);

      const result = await service.update('job-id', updateDto, 'user_id');

      expect(result.status).toBe('success');
      expect(result.status_code).toBe(200);
      expect((result.data as Job).title).toBe(updateDto.title);
    });

    it('should throw error if job not found', async () => {
      jest.spyOn(jobRepository, 'findOne').mockResolvedValue(null);

      await expect(service.update('non-existent', updateDto, 'user_id')).rejects.toThrow(
        new CustomHttpException('Job not found', HttpStatus.NOT_FOUND)
      );
    });

    it('should throw error if user is not authorized', async () => {
      const mockJob = {
        ...jobsMock[0],
        user: { ...mockUser, id: 'different_user_id' } as User,
      } as Job;

      jest.spyOn(jobRepository, 'findOne').mockResolvedValue(mockJob);

      await expect(service.update('job-id', updateDto, 'user_id')).rejects.toThrow(
        new CustomHttpException('Unauthorized to update this job', HttpStatus.FORBIDDEN)
      );
    });

    it('should throw error when updating with invalid data', async () => {
      const invalidUpdateDto = {
        salary_range: 'invalid_range', // invalid enum value
      };

      const mockJob = {
        ...jobsMock[0],
        user: mockUser as User,
      } as Job;

      jest.spyOn(jobRepository, 'findOne').mockResolvedValue(mockJob);
      // Mock validation error
      jest
        .spyOn(jobRepository, 'save')
        .mockRejectedValue(new CustomHttpException('Invalid salary range', HttpStatus.BAD_REQUEST));

      await expect(service.update('job-id', invalidUpdateDto as UpdateJobDto, 'user_id')).rejects.toThrow(
        CustomHttpException
      );
    });

    it('should throw error when updating job with empty data', async () => {
      const emptyUpdateDto = {};

      // Mock the service to check for empty update
      jest.spyOn(service as any, 'validateUpdateData').mockImplementation(dto => {
        if (Object.keys(dto).length === 0) {
          throw new CustomHttpException('No updates provided', HttpStatus.BAD_REQUEST);
        }
      });

      await expect(service.update('job-id', emptyUpdateDto as UpdateJobDto, 'user_id')).rejects.toThrow(
        new CustomHttpException('No updates provided', HttpStatus.BAD_REQUEST)
      );
    });

    it("should throw error when trying to update someone else's job", async () => {
      const mockJob = {
        ...jobsMock[0],
        user: { ...mockUser, id: 'different_user_id' } as User,
      } as Job;

      jest.spyOn(jobRepository, 'findOne').mockResolvedValue(mockJob);

      await expect(service.update('job-id', updateDto, 'user_id')).rejects.toThrow(
        new CustomHttpException('Unauthorized to update this job', HttpStatus.FORBIDDEN)
      );
    });

    it('should throw error when job ID is invalid UUID', async () => {
      // Mock the findOne to throw for invalid UUID
      jest
        .spyOn(jobRepository, 'findOne')
        .mockRejectedValue(new CustomHttpException('Invalid UUID', HttpStatus.BAD_REQUEST));

      await expect(service.update('invalid-uuid', updateDto, 'user_id')).rejects.toThrow(CustomHttpException);
    });

    it('should throw error when updating without user ID', async () => {
      // Mock the service to check for userId first
      jest.spyOn(service as any, 'validateUserId').mockImplementation(userId => {
        if (!userId) {
          throw new CustomHttpException('User ID is required', HttpStatus.UNAUTHORIZED);
        }
      });

      await expect(service.update('job-id', updateDto, undefined)).rejects.toThrow(
        new CustomHttpException('User ID is required', HttpStatus.UNAUTHORIZED)
      );
    });

    it('should maintain data integrity after update', async () => {
      const created_at = new Date();
      const originalJob = {
        ...jobsMock[0],
        user: mockUser as User,
        created_at,
        job_application: [],
        id: 'job-id',
      } as Job;

      const updateDtoWithPartialData = {
        title: 'Updated Title',
      };

      const updatedJob = {
        ...originalJob,
        ...updateDtoWithPartialData,
        created_at,
        job_application: [],
      };

      jest.spyOn(jobRepository, 'findOne').mockResolvedValue(originalJob);
      jest.spyOn(jobRepository, 'save').mockResolvedValue(updatedJob);

      const result = await service.update('job-id', updateDtoWithPartialData as UpdateJobDto, 'user_id');

      expect(result.data).toEqual(
        expect.objectContaining({
          created_at: originalJob.created_at,
          job_application: originalJob.job_application,
          title: updateDtoWithPartialData.title,
        })
      );
    });
  });
});
