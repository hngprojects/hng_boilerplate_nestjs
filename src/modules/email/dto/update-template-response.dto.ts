import { HttpStatus } from '@nestjs/common';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateTemplateDataDto {
  @ApiProperty({ description: 'Template name' })
  name: string;

  @ApiProperty({ description: 'Template content' })
  content: string;
}

export class UpdateTemplateResponseDto {
  @ApiProperty({ enum: HttpStatus, description: 'HTTP status code' })
  status_code: HttpStatus;

  @ApiProperty({ description: 'Response message' })
  message: string;

  @ApiProperty({ type: () => UpdateTemplateDataDto, description: 'Updated template data', required: false })
  data?: UpdateTemplateDataDto;
}
