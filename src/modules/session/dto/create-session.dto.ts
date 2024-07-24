import { IsNotEmpty, IsString, IsUUID, IsOptional } from 'class-validator';

export class CreateSessionDto {
  @IsUUID()
  user_id: string;

  @IsOptional()
  @IsString()
  device_browser?: string;

  @IsOptional()
  @IsString()
  device_browser_version?: string;

  @IsOptional()
  @IsString()
  device_os?: string;

  @IsOptional()
  @IsString()
  device_os_version?: string;

  @IsOptional()
  @IsString()
  device_type?: string;

  @IsOptional()
  @IsString()
  device_brand?: string;

  @IsOptional()
  @IsString()
  device_model?: string;

  @IsNotEmpty()
  expires_at: Date;
}
