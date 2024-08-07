import { HttpStatus, Injectable, NotFoundException, UnauthorizedException, UseGuards } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from '../user/entities/user.entity';
import { Repository } from 'typeorm';
import { Job } from './entities/job.entity';
import { JobDto } from './dto/job.dto';
import { pick } from '../../helpers/pick';
import { PaginationDto } from './dto/pagination.dto';
import { JobSearchDto } from './dto/jobSearch.dto';

@Injectable()
export class JobsService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Job)
    private readonly jobRepository: Repository<Job>
  ) {}

  async create(createJobDto: JobDto, userId: string) {
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

    await this.jobRepository.save(newJob);
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
  async delete(jobId: string) {
    const job = await this.jobRepository.findOne({
      where: { id: jobId },
    });

    job.is_deleted = true;
    const deleteJobEntityInstance = this.jobRepository.create(job);
    await this.jobRepository.save(deleteJobEntityInstance);
    return {
      status: 'success',
      message: 'Job details deleted successfully',
      status_code: 200,
    };
  }

  async searchJobs(searchDto: JobSearchDto, page: number, limit: number) {
    const query = this.jobRepository.createQueryBuilder('job');
    query.where('job.is_deleted = :isDeleted', { isDeleted: false });

    if (searchDto.location) {
      query.andWhere('job.location ILIKE :location', { location: `%${searchDto.location}%` });
    }

    if (searchDto.salary_range) {
      query.andWhere('job.salary_range = :salaryRange', { salaryRange: searchDto.salary_range });
    }

    if (searchDto.job_type) {
      query.andWhere('job.job_type = :jobType', { jobType: searchDto.job_type });
    }

    if (searchDto.job_mode) {
      query.andWhere('job.job_mode = :jobMode', { jobMode: searchDto.job_mode });
    }
    page = Math.max(1, Math.floor(Number(page)));
    limit = Math.max(1, Math.floor(Number(limit)));

    query.skip((page - 1) * limit).take(limit);
    const jobs = await query.getMany();

    return {
      status_code: HttpStatus.OK,
      data: jobs,
    };
  }
}
