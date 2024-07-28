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
        Object.keys(newJob).filter(x => !['user', 'created_at', 'updated_at'].includes(x))
      ),
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
