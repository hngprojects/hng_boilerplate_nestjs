import { Body, Controller, Delete, Get, Param, Post, Request, UseGuards } from '@nestjs/common';
import { JobsService } from './jobs.service';
import { JobDto } from './dto/job.dto';

@Controller('jobs')
export class JobsController {
  constructor(private readonly jobService: JobsService) {}

  @Post('/')
  async create(@Body() createJobDto: JobDto, @Request() req: any) {
    const user = req.user;
    return this.jobService.create(createJobDto, user.sub);
  }
}
