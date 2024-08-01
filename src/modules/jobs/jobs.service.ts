import { Injectable, NotFoundException, UnauthorizedException, UseGuards } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from '../user/entities/user.entity';
import { FindManyOptions, FindOptionsSelect, Repository } from 'typeorm';
import { Job } from './entities/job.entity';
import { JobDto } from './dto/job.dto';
import { omit } from '../../helpers/omit';

const omitColumns: string[] = ['user', 'created_at', 'updated_at', 'is_deleted'];

@Injectable()
export class JobsService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Job)
    private readonly jobRepository: Repository<Job>
  ) {}

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
      data: omit(newJob, omitColumns),
    };
  }

  async getJobs() {
    console.log(Object.keys(new Job()));
    const jobs = await this.jobRepository.find({
      where: {
        is_deleted: false,
      },
    });
    return {
      message: 'Jobs listing fetched successfully',
      status_code: 200,
      data: jobs.map(entry => omit(entry, omitColumns)),
    };
  }

  async getJob(id: string) {
    const job = await this.jobRepository.findOne({ where: { id, is_deleted: false } });
    if (!job)
      throw new NotFoundException({
        status_code: 404,
        status: 'Not found Exception',
        message: 'Job not found',
      });
    return {
      message: 'Job fetched successfully',
      status_code: 200,
      data: omit(job, omitColumns),
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
