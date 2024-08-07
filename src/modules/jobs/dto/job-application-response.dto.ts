import { ApiProperty } from '@nestjs/swagger';

export class JobApplicationResponseDto {
  @ApiProperty({
    example: 'success',
  })
  status: string;

  @ApiProperty({
    example: 'Application submitted successfully',
  })
  message: string;

  @ApiProperty({
    example: 200,
  })
  status_code: number;
}
