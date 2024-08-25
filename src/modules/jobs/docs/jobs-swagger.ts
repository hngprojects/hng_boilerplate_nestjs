import { applyDecorators } from '@nestjs/common';
import {
  ApiTags,
  ApiQuery,
  ApiInternalServerErrorResponse,
  ApiBearerAuth,
  ApiBadRequestResponse,
  ApiUnprocessableEntityResponse,
  ApiResponse,
  ApiCreatedResponse,
  ApiBody,
  ApiOperation,
} from '@nestjs/swagger';
import { JobApplicationDto } from '../dto/job-application.dto';
import { JobApplicationResponseDto } from '../dto/job-application-response.dto';
import { JobApplicationErrorDto } from '../dto/job-application-error.dto';

export function SubmitJobApplicationDocs() {
  return applyDecorators(
    ApiOperation({ summary: 'Submit job application' }),
    ApiBody({
      type: JobApplicationDto,
      description: 'Job application request body',
    }),
    ApiCreatedResponse({
      status: 201,
      description: 'Job application submitted successfully',
      type: JobApplicationResponseDto,
    }),
    ApiUnprocessableEntityResponse({
      description: 'Job application deadline passed',
      status: 422,
    }),
    ApiBadRequestResponse({ status: 400, description: 'Invalid request body', type: JobApplicationErrorDto }),
    ApiInternalServerErrorResponse({ status: 500, description: 'Internal server error', type: JobApplicationErrorDto })
  );
}
export function CreateNewJobDocs() {
  return applyDecorators(
    ApiOperation({ summary: 'Create a new job' }),
    ApiResponse({ status: 201, description: 'Job created successfully' }),
    ApiResponse({ status: 404, description: 'User not found' })
  );
}

export function SearchForJoblistingsDocs() {
  return applyDecorators(
    ApiOperation({ summary: 'Search for job listings' }),
    ApiQuery({ name: 'page', required: false, type: Number }),
    ApiQuery({ name: 'limit', required: false, type: Number }),
    ApiResponse({ status: 200, description: 'Successful response' }),
    ApiResponse({ status: 400, description: 'Bad request' })
  );
}

export function GetsAllJobsDocs() {
  return applyDecorators(
    ApiOperation({ summary: 'Gets all jobs' }),
    ApiResponse({ status: 200, description: 'Jobs returned successfully' }),
    ApiResponse({ status: 404, description: 'Job not found' })
  );
}

export function GetAJobByIDDocs() {
  return applyDecorators(
    ApiOperation({ summary: 'Gets a job by ID' }),
    ApiResponse({ status: 200, description: 'Job returned successfully' }),
    ApiResponse({ status: 404, description: 'Job not found' })
  );
}

export function DeleteAJobDocs() {
  return applyDecorators(
    ApiOperation({ summary: 'Delete a job' }),
    ApiResponse({ status: 200, description: 'Job deleted successfully' }),
    ApiResponse({ status: 403, description: 'You do not have permission to perform this action' }),
    ApiResponse({ status: 404, description: 'Job not found' })
  );
}
