import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';
import { BaseEntity } from 'typeorm';

export class CreateNotificationForAllUsersDto extends BaseEntity {
  @ApiProperty({
    description: 'The notificaiton content',
    example: 'Scheduled maintenance on 2024-10-15',
    required: true,
  })
  @IsNotEmpty()
  @IsString()
  message: string;
}
