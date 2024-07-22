import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { JobListing } from 'src/entities/job-listing.entity';
import { Repository } from 'typeorm';

@Injectable()
export class JobListingsService {
  constructor(
    @InjectRepository(JobListing)
    private jobListingsRepository: Repository<JobListing>
  ) {}

  async findById(id: string): Promise<JobListing> {
    const job = await this.jobListingsRepository.findOneBy({ id });

    if (!job) throw new NotFoundException(`Job not found`);

    return job;
  }
}
