import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsDateString, IsNotEmpty, IsString, IsUUID } from 'class-validator';

export class NotificationDto {
  @IsUUID()
  @IsNotEmpty()
  @ApiProperty()
  user_id: string;

  @IsUUID()
  @IsNotEmpty()
  @ApiProperty()
  notification_id: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty()
  message: string;

  @IsUUID()
  @IsNotEmpty()
  @ApiProperty()
  organisation_id?: string;

  @IsBoolean()
  @IsNotEmpty()
  @ApiProperty()
  isRead: boolean;

  @IsDateString()
  @IsNotEmpty()
  @ApiProperty()
  created_at: string;
}
