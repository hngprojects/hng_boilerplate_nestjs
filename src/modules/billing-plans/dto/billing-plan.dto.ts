import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional, IsIn, IsNumber, IsBoolean } from 'class-validator';

export class BillingPlanDto {
  @ApiProperty({ example: 'Free' })
  @IsString()
  name: string;

  @ApiProperty({ example: 'Basic plan with limited features' })
  @IsString()
  @IsOptional()
  description: string;

  @ApiProperty({ example: 'monthly', enum: ['monthly', 'yearly'] })
  @IsString()
  @IsIn(['monthly', 'yearly'])
  frequency: string;

  @ApiProperty({ example: 0 })
  @IsNumber()
  amount: number;

  @ApiProperty({ example: true })
  @IsBoolean()
  is_active: boolean;
}
