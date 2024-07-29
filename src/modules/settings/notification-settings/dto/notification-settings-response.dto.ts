import { IsDateString, IsNotEmpty, IsString, IsUUID } from 'class-validator';

export class NotificationSettingsResponseDto {
  @IsUUID()
  @IsNotEmpty()
  id: string;

  @IsDateString()
  created_at: Date;

  @IsDateString()
  updated_at: Date;

  @IsUUID()
  @IsNotEmpty()
  user_id: string;

  @IsNotEmpty()
  @IsString()
  email_notifications: boolean;

  @IsNotEmpty()
  @IsString()
  push_notifications: boolean;

  @IsNotEmpty()
  @IsString()
  sms_notifications: boolean;
}
