import { IsBoolean, IsOptional, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class ReactivateAccountDto {
  @ApiProperty({
    example: true,
    description: 'Email to reactivate the account',
    nullable: false,
  })
  @IsString()
  email: string;

  @ApiProperty({
    example: 'Now needed',
    description: 'Optional reason for reactivating the account',
    nullable: true,
    required: false,
  })
  @IsString()
  @IsOptional()
  reason?: string;
}
