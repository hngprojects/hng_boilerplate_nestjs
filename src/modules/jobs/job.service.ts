import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Job } from './job.entity';

@Injectable()
export class JobService {
  constructor(
    @InjectRepository(Job)
    private jobRepository: Repository<Job>
  ) {}

  async findAll(page: number = 1, pageSize: number = 10): Promise<any> {
    const [result, total] = await this.jobRepository.findAndCount({
      skip: (page - 1) * pageSize,
      take: pageSize,
    });

    const totalPages = Math.ceil(total / pageSize);

    return {
      message: 'Job listings retrieved successfully.',
      data: result,
      pagination: {
        current_page: page,
        total_pages: totalPages,
        page_size: pageSize,
        total_items: total,
      },
    };
  }
}
