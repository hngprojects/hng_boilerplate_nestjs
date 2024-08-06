import { IsBoolean, IsNotEmpty, IsOptional, IsString, IsUUID } from 'class-validator';

export class CreateNotificationDto {
  @IsNotEmpty()
  @IsString()
  message: string;

  @IsUUID()
  @IsOptional()
  organisation_id?: string;

  @IsBoolean()
  is_read?: boolean;
}
