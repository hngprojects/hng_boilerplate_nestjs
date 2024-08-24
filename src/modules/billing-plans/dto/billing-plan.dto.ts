import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional, IsNumberString, IsBoolean } from 'class-validator';

export class BillingPlanDto {
  @ApiProperty({ example: 'Free' })
  @IsString()
  name: string;

  @ApiProperty({ example: 'Free' })
  @IsString()
  @IsOptional()
  description: string;

  @ApiProperty({ example: 'monthly' })
  @IsString()
  frequency: string;

  @ApiProperty({ example: 0 })
  @IsNumberString()
  amount: number;

  @ApiProperty({ example: 'true' })
  @IsBoolean()
  is_active: boolean;
}
