import { ApiProperty } from '@nestjs/swagger';
import { Waitlist } from '../entities/waitlist.entity';
import { HttpStatus } from '@nestjs/common';

export class GetWaitlistResponseDto {
  @ApiProperty({
    description: 'Success message indicating the result of the operation.',
    example: 'Waitlist found successfully',
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
