import { IsBoolean, IsNotEmpty } from 'class-validator';

export class MarkNotificationAsReadDto {
  @IsBoolean()
  @IsNotEmpty()
  isRead: boolean;
}
