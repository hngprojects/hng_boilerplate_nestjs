import { IsBoolean, IsOptional, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class DeactivateAccountDto {
  @ApiProperty({
    example: true,
    description: 'Confirmation to deactivate the account',
    nullable: false,
  })
  @IsBoolean()
  confirmation: boolean;

  @ApiProperty({
    example: 'No longer needed',
    description: 'Optional reason for deactivating the account',
    nullable: true,
    required: false,
  })
  @IsString()
  @IsOptional()
  reason?: string;
}
