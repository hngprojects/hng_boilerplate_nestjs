import { IsNotEmpty, IsString, IsUUID } from 'class-validator';

export class CreateSessionDto {
  @IsUUID()
  user_id: string;

  @IsString()
  device_browser: string;

  @IsString()
  device_browser_version: string;

  @IsString()
  device_os: string;

  @IsString()
  device_os_version: string;

  @IsString()
  device_type: string;

  @IsString()
  device_brand: string;

  @IsString()
  device_mode: string;

  @IsNotEmpty()
  expires_at: Date;
}
