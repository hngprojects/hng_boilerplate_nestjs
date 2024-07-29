import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsDateString, IsNotEmpty, IsOptional, IsString, IsUUID } from 'class-validator';

export class CreateNotificationDto {
  @IsNotEmpty()
  @IsString()
  @ApiProperty()
  message: string;

  @IsUUID()
  @IsOptional()
  @ApiProperty()
  organisation_id?: string;

  @IsDateString()
  @IsOptional()
  @ApiProperty()
  created_at?: string;

  @IsBoolean()
  @IsOptional()
  @ApiProperty()
  is_read?: boolean;
}
