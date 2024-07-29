import { Injectable, InternalServerErrorException, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Job } from './job.entity';
import { PaginationResult } from './pagination-result.interface';

@Injectable()
export class JobService {
  private readonly logger = new Logger(JobService.name);

  constructor(
    @InjectRepository(Job)
    private jobRepository: Repository<Job>
  ) {}

  async getAllJobs(page: number = 1, pageSize: number = 10): Promise<PaginationResult<Job>> {
    try {
      const [jobs, totalJobs] = await this.jobRepository.findAndCount({
        skip: (page - 1) * pageSize,
        take: pageSize,
      });

      const totalPages = Math.ceil(totalJobs / pageSize);

      return {
        message: 'Job listings retrieved successfully.',
        data: jobs,
        pagination: {
          current_page: page,
          total_pages: totalPages,
          page_size: pageSize,
          total_items: totalJobs,
        },
      };
    } catch (error) {
      this.logger.error('Error retrieving job listings:', error.stack);
      throw new InternalServerErrorException('Failed to retrieve job listings.');
    }
  }
}
