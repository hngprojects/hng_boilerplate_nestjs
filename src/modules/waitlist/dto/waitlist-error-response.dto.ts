import { HttpStatus } from '@nestjs/common';
import { ApiProperty } from '@nestjs/swagger';

export class ErrorResponseDto {
  @ApiProperty({
    description: 'HTTP status code of the error response.',
    example: HttpStatus.BAD_REQUEST,
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

  @ApiProperty({
    description: 'Example of an unauthorized error response.',
    example: {
      status_code: HttpStatus.UNAUTHORIZED,
      message: 'Unauthorized access',
      error: 'Unauthorized',
    },
  })
  unauthorized_example: object;

  @ApiProperty({
    description: 'Example of a forbidden error response.',
    example: {
      status_code: HttpStatus.FORBIDDEN,
      message: 'Forbidden access',
      error: 'Forbidden',
    },
  })
  forbidden_example: object;

  @ApiProperty({
    description: 'Example of an internal server error response.',
    example: {
      status_code: HttpStatus.INTERNAL_SERVER_ERROR,
      message: 'Internal server error',
      error: 'Internal Server Error',
    },
  })
  internal_server_error_example: object;
}
