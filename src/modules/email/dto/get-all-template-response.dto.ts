import { HttpStatus } from '@nestjs/common';
import { ApiProperty } from '@nestjs/swagger';

export class TemplateDto {
  @ApiProperty({ description: 'Template name' })
  template_name: string;

  @ApiProperty({ description: 'Template content' })
  content: string;
}

export class GetAllTemplatesResponseDto {
  @ApiProperty({ enum: HttpStatus, description: 'HTTP status code' })
  status_code: HttpStatus;

  @ApiProperty({ description: 'Response message' })
  message: string;

  @ApiProperty({ type: [TemplateDto], description: 'List of templates', required: false })
  templates?: TemplateDto[];
}
