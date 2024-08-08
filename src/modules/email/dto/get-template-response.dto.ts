import { HttpStatus } from '@nestjs/common';
import { ApiProperty } from '@nestjs/swagger';

export class GetTemplateResponseDto {
  @ApiProperty({ enum: HttpStatus, description: 'HTTP status code' })
  status_code: HttpStatus;

  @ApiProperty({ description: 'Response message' })
  message: string;

  @ApiProperty({ description: 'Template content', required: false })
  template?: string;
}
