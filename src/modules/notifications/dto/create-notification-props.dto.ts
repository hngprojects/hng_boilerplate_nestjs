import { IsBoolean, IsDateString, IsNotEmpty, IsOptional, IsString, IsUUID } from 'class-validator';

export class CreateNotificationPropsDto {
  @IsNotEmpty()
  @IsString()
  message: string;

  @IsUUID()
  @IsOptional()
  organisation_id?: string;

  @IsDateString()
  @IsOptional()
  created_at: string;

  @IsBoolean()
  is_read: boolean;
}

export class Message {
  @IsNotEmpty()
  @IsString()
  message: string;
}
