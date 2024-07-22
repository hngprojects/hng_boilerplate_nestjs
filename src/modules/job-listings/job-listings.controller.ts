import { Controller, Param, Get, ParseUUIDPipe } from '@nestjs/common';
import { JobListingsService } from './job-listings.service';
import { JobListing } from 'src/entities/job-listing.entity';

@Controller('job-listings')
export class JobListingsController {
  constructor(private readonly jobListingsService: JobListingsService) {}

  @Get(':id')
  findOne(@Param('id', new ParseUUIDPipe()) id: string): Promise<JobListing> {
    return this.jobListingsService.findById(id);
  }
}
