import { IsEmail, IsNumber, IsString } from 'class-validator';

export class makePaymentDto {
  @IsString()
  user_id: string;

  @IsString()
  tx_ref: string;

  @IsEmail()
  email: string;

  @IsString()
  transaction_id: string;

  @IsString()
  plan_id: string;

  @IsString()
  full_name: string;

  @IsString()
  phone_number: string;

  @IsString()
  redirect_url: string;

  @IsNumber()
  amount: number;
}
