import { IsBoolean, IsDateString, IsNotEmpty, IsString, IsUUID } from 'class-validator';

export class NotificationDto {
  @IsUUID()
  @IsNotEmpty()
  user_id: string;

  @IsUUID()
  @IsNotEmpty()
  notification_id: string;

  @IsString()
  @IsNotEmpty()
  message: string;

  @IsUUID()
  @IsNotEmpty()
  organisation_id?: string;

  @IsBoolean()
  @IsNotEmpty()
  is_read: boolean;

  @IsDateString()
  @IsNotEmpty()
  created_at: string;
}
