import { HttpStatus, Injectable, NotFoundException, UseGuards } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from '../user/entities/user.entity';
import { Repository } from 'typeorm';
import { Job } from './entities/job.entity';
import { JobDto } from './dto/job.dto';
import { pick } from '../../helpers/pick';
import { CustomHttpException } from '../../helpers/custom-http-filter';
import * as SYS_MSG from '../../helpers/SystemMessages';

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

    if (!user) throw new CustomHttpException(SYS_MSG.USER_NOT_FOUND, HttpStatus.NOT_FOUND);

    const newJob = this.jobRepository.create(Object.assign(new Job(), { ...createJobDto, user }));

    await this.jobRepository.save(newJob);

    return {
      status: 'success',
      status_code: 201,
      message: SYS_MSG.JOB_CREATION_SUCCESSFUL,
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
      message: SYS_MSG.JOB_LISTING_RETRIEVAL_SUCCESSFUL,
      status_code: 200,
      data: jobs,
    };
  }

  async getJob(id: string) {
    const job = await this.jobRepository.findOne({ where: { id, is_deleted: false } });

    if (!job) throw new CustomHttpException(SYS_MSG.JOB_NOT_FOUND, HttpStatus.NOT_FOUND);

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
      message: SYS_MSG.JOB_DELETION_SUCCESSFUL,
      status_code: 200,
    };
  }
}
