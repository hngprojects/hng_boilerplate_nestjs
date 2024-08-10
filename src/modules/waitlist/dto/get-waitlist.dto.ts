import { ApiProperty } from '@nestjs/swagger';
import { Waitlist } from '../entities/waitlist.entity';
import { HttpStatus } from '@nestjs/common';

export class GetWaitlistResponseDto {
  @ApiProperty({
    description: 'HTTP status code indicating success.',
    example: HttpStatus.OK,
  })
  status_code: number;

  @ApiProperty({
    description: 'HTTP status code indicating success.',
    example: HttpStatus.OK,
  })
  status: number;

  @ApiProperty({
    description: 'Success message indicating the result of the operation.',
    example: 'Added to waitlist',
  })
  message: string;

  @ApiProperty({
    description: 'Data containing the waitlist entries.',
    type: [Waitlist],
  })
  data: {
    waitlist: Waitlist[];
  };
}
