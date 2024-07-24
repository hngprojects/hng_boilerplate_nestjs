import { Body, Controller, HttpCode, HttpStatus, Post } from '@nestjs/common';
import { JobService } from './job.service';
import { CreateJobDTO } from './dto/create-job.dto';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';

@ApiBearerAuth()
@ApiTags('Organisation')
@Controller('jobs')
export class JobController {
  constructor(private readonly jobService: JobService) {}

  @ApiOperation({ summary: 'Create Job Listing' })
  @ApiResponse({
    status: 200,
    description: 'Job created successfully',
    type: CreateJobDTO,
  })
  @HttpCode(HttpStatus.CREATED)
  @Post('/')
  async createNewJob(@Body() createJobDto: CreateJobDTO) {
    const job = await this.jobService.createJob(createJobDto);
    return {
      message: 'Job Listing Created successfully',
      job,
    };
  }
}
