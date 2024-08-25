import { applyDecorators, HttpStatus, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { GetWaitlistResponseDto } from '../dto/get-waitlist.dto';
import { ErrorResponseDto } from '../dto/waitlist-error-response.dto';
import { WaitlistResponseDto } from '../dto/create-waitlist-response.dto';

export function createWaitlistDocs() {
  return applyDecorators(
    ApiOperation({ summary: 'Create a new waitlist entry' }),
    ApiResponse({
      status: HttpStatus.CREATED,
      description: 'Successfully created a waitlist entry.',
      type: WaitlistResponseDto,
    }),
    ApiResponse({
      status: HttpStatus.BAD_REQUEST,
      description: 'Invalid input data.',
      type: ErrorResponseDto,
    })
  );
}

export function getAllWaitlistDocs() {
  return applyDecorators(
    ApiBearerAuth(),
    ApiOperation({ summary: 'Get all waitlist entries' }),
    ApiResponse({
      status: HttpStatus.OK,
      description: 'Successfully retrieved all waitlist entries.',
      type: GetWaitlistResponseDto,
    }),
    ApiResponse({
      status: HttpStatus.INTERNAL_SERVER_ERROR,
      description: 'Internal server error.',
      type: ErrorResponseDto,
    })
  );
}
