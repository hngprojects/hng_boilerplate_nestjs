import { IsNotEmpty, IsString, IsUUID } from 'class-validator';

export class CreateSessionDto {
  @IsUUID()
  @IsNotEmpty()
  userId: string;

  @IsString()
  @IsNotEmpty()
  device_browser: string;

  @IsString()
  @IsNotEmpty()
  device_browser_version: string;

  @IsString()
  @IsNotEmpty()
  device_os: string;

  @IsString()
  @IsNotEmpty()
  device_os_version: string;

  @IsString()
  @IsNotEmpty()
  device_type: string;

  @IsString()
  @IsNotEmpty()
  device_brand: string;

  @IsString()
  @IsNotEmpty()
  device_model: string;

  @IsNotEmpty()
  @IsNotEmpty()
  expires_at: Date;
}
