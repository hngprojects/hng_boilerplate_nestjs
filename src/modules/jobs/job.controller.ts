import { Controller, Get, Query } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags, ApiQuery } from '@nestjs/swagger';
import { JobService } from './job.service';
import { PaginationResult } from './pagination-result.interface';
import { Job } from './job.entity';

@ApiTags('Jobs')
@Controller('jobs')
export class JobController {
  constructor(private readonly jobService: JobService) {}

  @Get()
  @ApiOperation({ summary: 'Get all job listings' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'pageSize', required: false, type: Number })
  @ApiResponse({ status: 200, description: 'Job listings retrieved successfully.' })
  @ApiResponse({ status: 500, description: 'Failed to retrieve job listings.' })
  async getAllJobs(@Query('page') page = 1, @Query('pageSize') pageSize = 10): Promise<PaginationResult<Job>> {
    return this.jobService.getAllJobs(Number(page), Number(pageSize));
  }
}
