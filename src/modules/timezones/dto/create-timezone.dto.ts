import { IsString, IsOptional } from 'class-validator';

export class CreateTimezoneDto {
  @IsString()
  timezone: string;

  @IsString()
  @IsOptional()
  gmtOffset?: string;

  @IsString()
  @IsOptional()
  description?: string;
}
