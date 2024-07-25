import { Controller, Get, Query } from '@nestjs/common';
import { JobService } from './job.service';

@Controller('api/v1/jobs')
export class JobController {
  constructor(private readonly jobService: JobService) {}

  @Get()
  async findAll(@Query('page') page = 1, @Query('pageSize') pageSize = 10): Promise<any> {
    return this.jobService.findAll(Number(page), Number(pageSize));
  }
}
