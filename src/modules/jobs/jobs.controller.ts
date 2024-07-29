import { Body, Controller, Delete, Get, Param, Patch, Post, Query, Request, UseGuards } from '@nestjs/common';
import { JobsService } from './jobs.service';
import { JobDto } from './dto/job.dto';
import { PaginationDto } from './dto/pagination.dto';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';

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

  @Get('/')
  @ApiOperation({ summary: 'Retrieve all job listings' })
  @ApiResponse({ status: 200, description: 'Job listings retrieved successfully' })
  @ApiResponse({ status: 400, description: 'Invalid pagination parameters' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  async findAll(@Query() paginationDto: PaginationDto) {
    return this.jobService.findAll(paginationDto);
  }

  @Patch('/:id')
  @ApiOperation({ summary: 'Update a job post' })
  @ApiResponse({ status: 200, description: 'Job details updated successfully' })
  @ApiResponse({ status: 404, description: 'Job not found' })
  @ApiResponse({ status: 404, description: 'User not found' })
  @ApiResponse({ status: 400, description: 'Bad Request' })
  async updateJob(@Param('id') id: string, @Body() updateJobDto: JobDto, @Request() req: any) {
    const user = req.user;
    return this.jobService.updateJob(id, updateJobDto, user.sub);
  }
}
