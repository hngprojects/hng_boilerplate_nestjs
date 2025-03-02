import { HttpStatus } from '@nestjs/common';
import { ApiProperty } from '@nestjs/swagger';

export class BadRequestErrorResponseDto {
  @ApiProperty({
    description: 'HTTP status code of the error response.',
    example: 400,
  })
  status_code: number;

  @ApiProperty({
    description: 'Error message(s) describing the issue. Can be a single string or an array of strings.',
    example: ['Name should not be empty', 'Email must be an email'],
    oneOf: [{ type: 'string' }, { type: 'array', items: { type: 'string' } }],
  })
  message: string | string[];

  @ApiProperty({
    description: 'Error type.',
    example: 'Bad Request',
  })
  error: string;
}

export class UnauthorizedErrorResponseDto {
  @ApiProperty({
    description: 'HTTP status code of the error response.',
    example: 401,
  })
  status_code: number;

  @ApiProperty({
    description: 'Error message describing the issue.',
    example: 'Unauthorized access.',
  })
  message: string;

  @ApiProperty({
    description: 'Error type.',
    example: 'Unauthorized',
  })
  error: string;
}

export class ForbiddenErrorResponseDto {
  @ApiProperty({
    description: 'HTTP status code of the error response.',
    example: 403,
  })
  status_code: number;

  @ApiProperty({
    description: 'Error message describing the issue.',
    example: 'Forbidden access.',
  })
  message: string;

  @ApiProperty({
    description: 'Error type.',
    example: 'Forbidden',
  })
  error: string;
}

export class InternalServerErrorResponseDto {
  @ApiProperty({
    description: 'HTTP status code of the error response.',
    example: 500,
  })
  status_code: number;

  @ApiProperty({
    description: 'Error message describing the issue.',
    example: 'Internal server error.',
  })
  message: string;

  @ApiProperty({
    description: 'Error type.',
    example: 'Internal Server Error',
  })
  error: string;
}

export class NotFoundErrorResponseDto {
  @ApiProperty({
    description: 'HTTP status code of the error response.',
    example: 404,
  })
  status_code: number;

  @ApiProperty({
    description: 'Error message describing the issue.',
    example: 'Resource not found.',
  })
  message: string;

  @ApiProperty({
    description: 'Error type.',
    example: 'Not Found',
  })
  error: string;
}
