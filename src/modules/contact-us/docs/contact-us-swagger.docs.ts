import { applyDecorators, HttpStatus } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiProperty, ApiQuery, ApiResponse } from '@nestjs/swagger';
import { CreateContactResponseDto } from '../dto/create-contact-response.dto';
import { CreateContactErrorDto } from '../dto/create-contact-error.dto';

export function createContactDocs() {
  return applyDecorators(
    ApiBearerAuth(),
    ApiOperation({ summary: 'Post a Contact us Message' }),
    ApiResponse({
      status: HttpStatus.CREATED,
      description: 'Successfully made enquiry.',
      type: CreateContactResponseDto,
    }),
    ApiResponse({
      status: HttpStatus.BAD_REQUEST,
      description: 'Invalid input data.',
      type: CreateContactErrorDto,
    })
  );
}

export function getAllContactDocs() {
  return applyDecorators(
    ApiBearerAuth(),
    ApiOperation({ summary: 'Get all contact messages' }),
    ApiQuery({ name: 'page', required: false, type: Number, description: 'Page number' }),
    ApiQuery({ name: 'limit', required: false, type: Number, description: 'Number of contact messages per page' }),
    ApiResponse({
      status: HttpStatus.OK,
      description: 'Successfully retrieved messages',
    })
  );
}
