import {
  Body,
  Controller,
  DefaultValuePipe,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
  Request,
  UseGuards,
  ValidationPipe,
} from '@nestjs/common';
import { JobsService } from './jobs.service';
import { JobDto } from './dto/job.dto';
import { PaginationDto } from './dto/pagination.dto';
import { ApiBearerAuth, ApiOperation, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';
import { JobGuard } from './guards/job.guard';
import { skipAuth } from '../../helpers/skipAuth';
import { JobSearchDto } from './dto/jobSearch.dto';

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

  @Get('search')
  @ApiOperation({ summary: 'Search for job listings' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiResponse({ status: 200, description: 'Successful response' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  async searchJobs(
    @Query(new ValidationPipe({ transform: true, forbidNonWhitelisted: true }))
    searchDto: JobSearchDto
  ) {
    const page = searchDto.page || 1;
    const limit = searchDto.limit || 10;
    const { page: _, limit: __, ...otherSearchParams } = searchDto;

    return this.jobService.searchJobs(otherSearchParams, page, limit);
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
}
