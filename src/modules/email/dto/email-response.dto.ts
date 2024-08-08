import { HttpStatus } from '@nestjs/common';
import { ApiProperty } from '@nestjs/swagger';

export class CreateTemplateResponseDto {
  @ApiProperty({ enum: HttpStatus, description: 'HTTP status code' })
  status_code: HttpStatus;

  @ApiProperty({ description: 'Response message' })
  message: string;

  @ApiProperty({ type: [String], description: 'List of validation errors', required: false })
  validation_errors?: string[];
}

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

export class GetTemplateResponseDto {
  @ApiProperty({ enum: HttpStatus, description: 'HTTP status code' })
  status_code: HttpStatus;

  @ApiProperty({ description: 'Response message' })
  message: string;

  @ApiProperty({ description: 'Template content', required: false })
  template?: string;
}

export class DeleteTemplateResponseDto {
  @ApiProperty({ enum: HttpStatus, description: 'HTTP status code' })
  status_code: HttpStatus;

  @ApiProperty({ description: 'Response message' })
  message: string;
}

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

export class ErrorResponseDto {
  @ApiProperty({ enum: HttpStatus, description: 'HTTP status code' })
  status_code: HttpStatus;

  @ApiProperty({ description: 'Response message' })
  message: string;
}
