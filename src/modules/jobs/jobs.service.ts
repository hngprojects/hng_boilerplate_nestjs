import { HttpStatus, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CustomHttpException } from '../../helpers/custom-http-filter';
import { pick } from '../../helpers/pick';
import * as SYS_MSG from '../../helpers/SystemMessages';
import { User } from '../user/entities/user.entity';
import { FindJobResponseDto } from './dto/find-job-response.dto';
import { JobApplicationResponseDto } from './dto/job-application-response.dto';
import { JobApplicationDto } from './dto/job-application.dto';
import { JobDto } from './dto/job.dto';
import { JobApplication } from './entities/job-application.entity';
import { Job } from './entities/job.entity';
import { isPassed } from './utils/helpers';

@Injectable()
export class JobsService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Job)
    private readonly jobRepository: Repository<Job>,
    @InjectRepository(JobApplication)
    private readonly jobApplicationRepository: Repository<JobApplication>
  ) {}

  async applyForJob(jobId: string, jobApplicationDto: JobApplicationDto): Promise<JobApplicationResponseDto> {
    const job: FindJobResponseDto = await this.getJob(jobId);

    const { is_deleted, deadline } = job.data;

    if (is_deleted) {
      throw new CustomHttpException('Job deleted', HttpStatus.NOT_FOUND);
    }

    if (isPassed(deadline)) {
      throw new CustomHttpException(SYS_MSG.DEADLINE_PASSED, HttpStatus.UNPROCESSABLE_ENTITY);
    }

    const { resume, applicant_name, ...others } = jobApplicationDto;

    // TODO: Upload resume to the cloud and grab URL

    const resumeUrl = `https://example.com/${applicant_name.split(' ').join('_')}.pdf`;

    const createJobApplication = this.jobApplicationRepository.create({
      ...others,
      applicant_name,
      resume: resumeUrl,
      ...job,
    });

    await this.jobApplicationRepository.save(createJobApplication);

    return {
      status: 'success',
      message: 'Application submitted successfully',
      status_code: HttpStatus.CREATED,
    };
  }

  async create(createJobDto: JobDto, userId: string) {
    // Check if the user exists
    const user = await this.userRepository.findOne({
      where: { id: userId },
    });

    if (!user)
      throw new NotFoundException({
        status_code: 404,
        status: 'Not found Exception',
        message: 'User not found',
      });

    const newJob = this.jobRepository.create(Object.assign(new Job(), { ...createJobDto, user }));

    // Save the new Job entity to the database
    await this.jobRepository.save(newJob);

    // Return a success response
    return {
      status: 'success',
      status_code: 201,
      message: 'Job listing created successfully',
      data: pick(
        newJob,
        Object.keys(newJob).filter(x => !['user', 'created_at', 'updated_at', 'is_deleted'].includes(x))
      ),
    };
  }

  async getJobs() {
    const jobs = await this.jobRepository.find();
    return {
      message: 'Jobs listing fetched successfully',
      status_code: 200,
      data: jobs,
    };
  }

  async getJob(id: string) {
    const job = await this.jobRepository.findOne({ where: { id } });
    if (!job)
      throw new NotFoundException({
        status_code: 404,
        status: 'Not found Exception',
        message: 'Job not found',
      });
    return {
      message: 'Job fetched successfully',
      status_code: 200,
      data: job,
    };
  }

  async update(id: string, updateJobDto: Partial<JobDto>) {
    const job = await this.jobRepository.findOne({ where: { id } });
    if (!job) {
      throw new NotFoundException({
        status_code: 404,
        status: 'Not found Exception',
        message: 'Job not found',
      });
    }

    Object.assign(job, updateJobDto);
    const updatedJob = await this.jobRepository.save(job);

    return {
      data: updatedJob,
      message: 'Job details updated successfully',
      status_code: 200,
    };
  }

  async delete(jobId: string) {
    // Check if listing exists
    const job = await this.jobRepository.findOne({
      where: { id: jobId },
    });

    job.is_deleted = true;
    const deleteJobEntityInstance = this.jobRepository.create(job);

    // Save the new Job entity to the database
    await this.jobRepository.save(deleteJobEntityInstance);

    // Return a success response
    return {
      status: 'success',
      message: 'Job details deleted successfully',
      status_code: 200,
    };
  }
}
