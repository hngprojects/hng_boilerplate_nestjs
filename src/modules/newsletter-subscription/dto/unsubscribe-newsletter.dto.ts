import { ApiProperty } from '@nestjs/swagger';
import { IsEmail } from 'class-validator';

export class UnsubscribeNewsletterDto {
  @ApiProperty({ description: 'Email of the user to unsubscribe' })
  @IsEmail()
  email: string;
}
