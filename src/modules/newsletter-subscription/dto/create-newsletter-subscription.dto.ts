import { ApiProperty } from '@nestjs/swagger';
import { IsEmail } from 'class-validator';

export class CreateNewsletterSubscriptionDto {
  @ApiProperty({ description: 'Newsletter subscribers emails' })
  @IsEmail()
  email: string;
}
