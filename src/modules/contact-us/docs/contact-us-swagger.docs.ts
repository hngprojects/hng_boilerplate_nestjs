import { applyDecorators, HttpStatus } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiProperty, ApiResponse } from '@nestjs/swagger';
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
