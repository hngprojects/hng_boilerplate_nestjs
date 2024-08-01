import { ApiProperty } from '@nestjs/swagger';
import { IsArray, ArrayNotEmpty, IsEmail } from 'class-validator';

export class SendInvitesDto {
  @ApiProperty({
    description: 'emails',
    type: 'array',
  })
  @IsArray()
  @ArrayNotEmpty()
  @IsEmail({}, { each: true })
  emails: string[];
}
