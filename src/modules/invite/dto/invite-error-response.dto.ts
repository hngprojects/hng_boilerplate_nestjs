import { ApiProperty } from '@nestjs/swagger';

export class ErrorResponseDto {
  @ApiProperty({ example: 400 })
  status_code: number;

  @ApiProperty({ example: 'Validation failed: email must be a valid email address.' })
  message: string;
}
