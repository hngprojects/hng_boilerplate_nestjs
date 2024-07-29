import { Injectable, NotFoundException, UseGuards } from '@nestjs/common';
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

  /**
   * Retrieves a paginated list of job listings.
   *
   * @param {PaginationDto} paginationDto - The pagination parameters.
   * @return {Promise<{ message: string, data: Job[], pagination: { current_page: number, total_pages: number, page_size: number, total_items: number } }>} - The paginated list of job listings.
   */
  async findAll(paginationDto: PaginationDto): Promise<{
    status: string;
    status_code: number;
    message: string;
    data: Job[];
    pagination: {
      current_page: number;
      total_pages: number;
      page_size: number;
      total_items: number;
    };
  }> {
    const { page, size } = paginationDto;

    const [result, total] = await this.jobRepository.findAndCount({
      skip: (page - 1) * size,
      take: size,
      where: { is_deleted: false },
    });

    const totalPages = Math.ceil(total / size);

    return {
      status: 'success',
      status_code: 200,
      message: 'Job listings retrieved successfully.',
      data: result,
      pagination: {
        current_page: page,
        total_pages: totalPages,
        page_size: size,
        total_items: total,
      },
    };
  }

  async updateJob(id: string, updateJobDto: JobDto, userId: string) {
    const user = await this.userRepository.findOne({
      where: { id: userId },
    });

    if (!user) throw new NotFoundException('User not found');

    // Check if the job exists
    const job = await this.jobRepository.findOne({
      where: { id },
    });

    if (!job) {
      throw new NotFoundException('Job not found');
    }

    Object.assign(job, updateJobDto);

    await this.jobRepository.save(job);

    return {
      message: 'Job details updated successfully',
      status_code: 200,
      data: job,
    };
  }
}
