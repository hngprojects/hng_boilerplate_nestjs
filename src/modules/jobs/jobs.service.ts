import { Injectable, NotFoundException, UseGuards } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from '../user/entities/user.entity';
import { Repository } from 'typeorm';
import { Job } from './entities/job.entity';
import { JobDto } from './dto/job.dto';
import { pick } from '../../helpers/pick';

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
    const jobs = await this.jobRepository.find({ where: { is_deleted: false } });

    jobs.map(x => delete x.is_deleted);
    return {
      message: 'Jobs listing fetched successfully',
      status_code: 200,
      data: jobs,
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

    delete job.is_deleted;
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
}
