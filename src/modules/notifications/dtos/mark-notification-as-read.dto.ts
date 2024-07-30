import { IsBoolean, IsNotEmpty } from 'class-validator';

export class MarkNotificationAsReadDto {
  @IsBoolean()
  @IsNotEmpty()
  is_read: boolean;
}
