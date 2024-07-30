import { Injectable, NotFoundException, UnauthorizedException, UseGuards } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from '../user/entities/user.entity';
import { Repository } from 'typeorm';
import { Job } from './entities/job.entity';
import { JobDto } from './dto/job.dto';
import { pick } from '../../helpers/pick';
import { PaginationDto } from './dto/pagination.dto';

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
}
