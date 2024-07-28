import { IsBoolean } from 'class-validator';

export class MarkNotificationAsReadDto {
  @IsBoolean()
  isRead: boolean;
}
