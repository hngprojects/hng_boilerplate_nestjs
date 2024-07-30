import { IsDateString, IsNotEmpty, IsUUID } from 'class-validator';
import { NotificationSettingsDto } from './notification-settings.dto';

export class NotificationSettingsResponseDto extends NotificationSettingsDto {
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
}
