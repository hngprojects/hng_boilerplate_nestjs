import { IsBoolean, IsOptional, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class DeactivateProfileDto {
  @ApiProperty({
    example: true,
    description: 'Confirmation to deactivate the profile',
    nullable: false,
  })
  @IsBoolean()
  confirmation: boolean;

  @ApiProperty({
    example: 'No longer needed',
    description: 'Optional reason for deactivating the profile',
    nullable: true,
    required: false,
  })
  @IsString()
  @IsOptional()
  reason?: string;
}
