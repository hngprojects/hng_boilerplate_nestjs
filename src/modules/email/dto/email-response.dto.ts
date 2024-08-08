import { HttpStatus } from '@nestjs/common';

export class CreateTemplateResponseDto {
  status_code: HttpStatus;
  message: string;
  validation_errors?: string[];
}

export class UpdateTemplateResponseDto {
  status_code: HttpStatus;
  message: string;
  data?: {
    name: string;
    content: string;
  };
}

export class GetTemplateResponseDto {
  status_code: HttpStatus;
  message: string;
  template?: string;
}

export class DeleteTemplateResponseDto {
  status_code: HttpStatus;
  message: string;
}

export class GetAllTemplatesResponseDto {
  status_code: HttpStatus;
  message: string;
  templates?: {
    template_name: string;
    content: string;
  }[];
}

export class ErrorResponseDto {
  status_code: HttpStatus;
  message: string;
}
