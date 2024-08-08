import { HttpStatus } from '@nestjs/common';
import { ApiProperty } from '@nestjs/swagger';

export class ErrorResponseDto {
  @ApiProperty({ enum: HttpStatus, description: 'HTTP status code' })
  status_code: HttpStatus;

  @ApiProperty({ description: 'Response message' })
  message: string;
}
