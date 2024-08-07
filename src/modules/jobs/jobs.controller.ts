import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Query,
  Request,
  UseGuards,
  ValidationPipe,
  ParseUUIDPipe,
} from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiBody,
  ApiCreatedResponse,
  ApiInternalServerErrorResponse,
  ApiOperation,
  ApiQuery,
  ApiResponse,
  ApiTags,
  ApiUnprocessableEntityResponse,
} from '@nestjs/swagger';
import { skipAuth } from '../../helpers/skipAuth';
import { JobApplicationErrorDto } from './dto/job-application-error.dto';
import { JobApplicationResponseDto } from './dto/job-application-response.dto';
import { JobApplicationDto } from './dto/job-application.dto';
import { JobDto } from './dto/job.dto';
import { JobsService } from './jobs.service';
import { SuperAdminGuard } from '../../guards/super-admin.guard';
import { JobSearchDto } from './dto/jobSearch.dto';

@ApiTags('Jobs')
@ApiBearerAuth()
@Controller('jobs')
export class JobsController {
  constructor(private readonly jobService: JobsService) {}

  @skipAuth()
  @ApiOperation({ summary: 'Submit job application' })
  @ApiBody({
    type: JobApplicationDto,
    description: 'Job application request body',
  })
  @ApiCreatedResponse({
    status: 201,
    description: 'Job application submitted successfully',
    type: JobApplicationResponseDto,
  })
  @ApiUnprocessableEntityResponse({
    description: 'Job application deadline passed',
    status: 422,
  })
  @ApiBadRequestResponse({ status: 400, description: 'Invalid request body', type: JobApplicationErrorDto })
  @ApiInternalServerErrorResponse({ status: 500, description: 'Internal server error', type: JobApplicationErrorDto })
  @Post('/:id/applications')
  async applyForJob(@Param('id') id: string, @Body() jobApplicationDto: JobApplicationDto) {
    return this.jobService.applyForJob(id, jobApplicationDto);
  }

  @UseGuards(SuperAdminGuard)
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

  @Get('/')
  @ApiOperation({ summary: 'Gets all jobs' })
  @ApiResponse({ status: 200, description: 'Jobs returned successfully' })
  @ApiResponse({ status: 404, description: 'Job not found' })
  async getAllJobs() {
    return this.jobService.getJobs();
  }

  @Get('/:id')
  @ApiOperation({ summary: 'Gets a job by ID' })
  @ApiResponse({ status: 200, description: 'Job returned successfully' })
  @ApiResponse({ status: 404, description: 'Job not found' })
  async getJob(@Param('id', ParseUUIDPipe) id) {
    return this.jobService.getJob(id);
  }

  @UseGuards(SuperAdminGuard)
  @Delete('/:id')
  @ApiOperation({ summary: 'Delete a job' })
  @ApiResponse({ status: 200, description: 'Job deleted successfully' })
  @ApiResponse({ status: 403, description: 'You do not have permission to perform this action' })
  @ApiResponse({ status: 404, description: 'Job not found' })
  async delete(@Param('id', ParseUUIDPipe) id) {
    return this.jobService.delete(id);
  }
}
