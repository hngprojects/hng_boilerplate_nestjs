import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class WaitlistResponseDto {
  @ApiProperty({
    description: 'Success message indicating the user is signed up.',
    example: 'You are all signed up!',
  })
  @IsString()
  message: string;
}
