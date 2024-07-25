import { IsBoolean, IsEmail, IsNotEmpty } from 'class-validator';

export class NotificationSettingsDto {
  @IsNotEmpty()
  @IsEmail()
  user_id: string;

  @IsBoolean()
  email_notifications: boolean;

  @IsBoolean()
  push_notifications: boolean;

  @IsBoolean()
  sms_notifications: boolean;
}
