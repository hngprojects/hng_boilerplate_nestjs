import { ApiProperty } from '@nestjs/swagger';

export class LoginErrorResponseDto {
  @ApiProperty({
    description: 'Error message providing details about the login failure',
    example: 'Invalid credentials provided',
  })
  message: string;

  @ApiProperty({
    description: 'HTTP status code indicating the type of error',
    example: 401,
  })
  status_code: number;
}
