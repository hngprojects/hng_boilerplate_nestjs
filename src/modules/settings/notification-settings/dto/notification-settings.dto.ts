import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsEmail, IsNotEmpty } from 'class-validator';

export class NotificationSettingsDto {
  settingName: string;
  settingValue: string;

  @ApiProperty()
  @IsBoolean()
  email_notifications: boolean;

  @ApiProperty()
  @IsBoolean()
  push_notifications: boolean;

  @ApiProperty()
  @IsBoolean()
  sms_notifications: boolean;
}
