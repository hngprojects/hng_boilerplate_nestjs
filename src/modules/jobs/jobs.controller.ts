import { Body, Controller, Delete, Get, Param, Patch, Post, Query, Request, UseGuards } from '@nestjs/common';
import { JobsService } from './jobs.service';
import { JobDto } from './dto/job.dto';
import { PaginationDto } from './dto/pagination.dto';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { JobGuard } from './guards/job.guard';
import { skipAuth } from '../../helpers/skipAuth';

@ApiTags('Jobs')
@ApiBearerAuth()
@Controller('jobs')
export class JobsController {
  constructor(private readonly jobService: JobsService) {}

  @Post('/')
  @ApiOperation({ summary: 'Create a new job' })
  @ApiResponse({ status: 201, description: 'Job created successfully' })
  @ApiResponse({ status: 404, description: 'User not found' })
  async createJob(@Body() createJobDto: JobDto, @Request() req: any) {
    const user = req.user;
    return this.jobService.create(createJobDto, user.sub);
  }

  @skipAuth()
  @Get('/')
  @ApiOperation({ summary: 'Gets all jobs' })
  @ApiResponse({ status: 200, description: 'Jobs returned successfully' })
  @ApiResponse({ status: 404, description: 'User not found' })
  async getAllJobs() {
    return this.jobService.getJobs();
  }

  @skipAuth()
  @Get('/:id')
  @ApiOperation({ summary: 'Gets a job by ID' })
  @ApiResponse({ status: 200, description: 'Job returned successfully' })
  @ApiResponse({ status: 404, description: 'Job not found' })
  async getJob(@Param('id') id: string) {
    return this.jobService.getJob(id);
  }

  @UseGuards(JobGuard)
  @Delete('/:id')
  @ApiOperation({ summary: 'Delete a job' })
  @ApiResponse({ status: 200, description: 'Job deleted successfully' })
  @ApiResponse({ status: 403, description: 'You do not have permission to perform this action' })
  @ApiResponse({ status: 404, description: 'Job not found' })
  async delete(@Param('id') id: string) {
    return this.jobService.delete(id);
  }

  @UseGuards(JobGuard)
  @Patch('/:id')
  @ApiOperation({ summary: 'Update a job' })
  @ApiResponse({ status: 200, description: 'Job updated successfully' })
  @ApiResponse({ status: 403, description: 'You do not have permission to perform this action' })
  @ApiResponse({ status: 404, description: 'Job not found' })
  async update(@Param('id') id: string, @Body() updateJobDto: Partial<JobDto>) {
    return this.jobService.update(id, updateJobDto);
  }
}
