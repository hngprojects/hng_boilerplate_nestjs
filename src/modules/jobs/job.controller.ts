import { Controller, Get, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { JobService } from './job.service';
import { Job } from './job.entity';
import { PaginationResult } from './pagination-result.interface';

@ApiTags('jobs')
@Controller('jobs')
export class JobController {
  constructor(private readonly jobService: JobService) {}

  @Get()
  @ApiOperation({ summary: 'Retrieve all job listings' })
  @ApiResponse({ status: 200, description: 'Job listings retrieved successfully.' })
  @ApiResponse({ status: 400, description: 'Invalid request data.' })
  async getAllJobs(
    @Query('page') page: number = 1,
    @Query('pageSize') pageSize: number = 10
  ): Promise<PaginationResult<Job>> {
    return this.jobService.findAll(Number(page), Number(pageSize));
  }
}
