import { IsArray, IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class CreatePaymentPlanDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsNotEmpty()
  description: string;

  @IsNumber()
  @IsNotEmpty()
  amount: number;

  @IsNumber()
  @IsNotEmpty()
  duration: number;

  @IsString()
  @IsNotEmpty()
  interval: string;

  @IsString()
  features: string;
}
