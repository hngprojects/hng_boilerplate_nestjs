// jobs.service.ts

import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Job } from './job-listing.entity';
import { UpdateJobDto } from './dto/update-job.dto';
import { CreateJobDto } from './dto/create-job.dto';
import { User } from './user.entity';

@Injectable()
export class JobsService {
  constructor(
    @InjectRepository(Job)
    private jobsRepository: Repository<Job>
  ) {}

  async createJob(createJobDto: CreateJobDto, user: User): Promise<Job> {
    const job = this.jobsRepository.create({ ...createJobDto, user });
    await this.jobsRepository.save(job);
    return job;
  }

  async updateJob(id: string, updateJobDto: UpdateJobDto): Promise<Job> {
    const job = await this.jobsRepository.findOne({ where: { id } });

    if (!job) {
      throw new NotFoundException(`Job with ID ${id} not found`);
    }

    Object.assign(job, updateJobDto);

    try {
      await this.jobsRepository.save(job);
    } catch (error) {
      throw new BadRequestException('Failed to update job details');
    }

    return job;
  }
}
