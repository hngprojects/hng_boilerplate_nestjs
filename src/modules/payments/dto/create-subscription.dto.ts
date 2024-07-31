import { IsEnum, IsNotEmpty, IsString } from 'class-validator';

enum BillingOption {
  MONTHLY = 'monthly',
  YEARLY = 'yearly',
}

export class CreateSubscriptionDto {
  @IsNotEmpty()
  @IsString()
  organization_id: string;

  @IsNotEmpty()
  @IsString()
  plan_id: string;

  @IsNotEmpty()
  @IsString()
  full_name: string;

  @IsNotEmpty()
  @IsString()
  @IsEnum(BillingOption)
  billing_option: 'monthly' | 'yearly';

  @IsNotEmpty()
  @IsString()
  redirect_url: string;
}
