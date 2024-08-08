import { IsEnum, IsNotEmpty, IsString, IsUUID } from 'class-validator';

enum BillingOption {
  MONTHLY = 'monthly',
  YEARLY = 'yearly',
}

export class CreateSubscriptionDto {
  @IsNotEmpty()
  @IsString()
  @IsUUID('4', { message: 'Invalid UUID for organization_id' })
  organization_id: string;

  @IsNotEmpty()
  @IsString()
  @IsUUID('4', { message: 'Invalid UUID for plan_id' })
  plan_id: string;

  @IsNotEmpty()
  @IsString()
  full_name: string;

  @IsNotEmpty()
  @IsString()
  @IsEnum(BillingOption, { message: `billing_option must be either 'monthly' or 'yearly'` })
  billing_option: 'monthly' | 'yearly';

  @IsNotEmpty()
  @IsString()
  redirect_url: string;
}
