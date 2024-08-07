import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class BadRequestResponseDto {
  @ApiProperty({
    description: 'The status of the request',
    example: 'Unprocessable entity exception',
  })
  @IsString()
  status: string;

  @ApiProperty({
    description: 'The response code',
    example: '422',
  })
  @IsString()
  status_code: string;

  @ApiProperty({
    description: 'The message of the response',
    example: 'Invalid organisation credentials',
  })
  @IsString()
  message: string;
}

export class NotFoundResponseDto {
  @ApiProperty({
    description: 'The response code',
    example: '404',
  })
  @IsString()
  status_code: string;

  @ApiProperty({
    description: 'The message of the response',
    example: 'Product not found',
  })
  @IsString()
  message: string;
}

export class NoResultsResponseDto {
  @ApiProperty({
    description: 'The status of the request',
    example: 'No Content',
  })
  @IsString()
  status: string;

  @ApiProperty({
    description: 'The response code',
    example: '204',
  })
  @IsString()
  status_code: string;

  @ApiProperty({
    description: 'The message of the response',
    example: 'No products found',
  })
  @IsString()
  message: string;
}

export class ForbiddenErrorResponseDto {
  @ApiProperty({
    description: 'The status of the request',
    example: 'fail',
  })
  @IsString()
  status: string;

  @ApiProperty({
    description: 'The response code',
    example: '403',
  })
  @IsString()
  status_code: string;

  @ApiProperty({
    description: 'The message of the response',
    example: 'Not allowed to perform this action',
  })
  @IsString()
  message: string;
}

export class ServerErrorResponseDto {
  @ApiProperty({
    description: 'The status of the request',
    example: 'Internal server error',
  })
  @IsString()
  status: string;

  @ApiProperty({
    description: 'The response code',
    example: '500',
  })
  @IsString()
  status_code: string;

  @ApiProperty({
    description: 'The message of the response',
    example: 'An unexpected error occurred. Please try again later.',
  })
  @IsString()
  message: string;
}
