import { IsNotEmpty, Length } from 'class-validator';
import { IsValidPhoneNumber } from '../helpers/phone-number.validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateSmsDto {
  @ApiProperty({ description: 'Phone number', example: '+2349027819101' })
  @IsNotEmpty()
  @IsValidPhoneNumber()
  phone_number: string;

  @ApiProperty({ description: 'message body', example: 'Hello there!' })
  @IsNotEmpty()
  @Length(1, 50)
  message: string;
}
