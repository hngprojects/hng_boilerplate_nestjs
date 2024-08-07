import { IsEmail, IsEmpty, IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class CreateFlutterwavePaymentDto {
  @IsNotEmpty()
  @IsEmail()
  email: string;

  @IsNotEmpty()
  @IsString()
  organisation_id: string;

  @IsNotEmpty()
  @IsString()
  plan_id: string;

  @IsNotEmpty()
  @IsString()
  full_name: string;

  @IsNotEmpty()
  @IsString()
  billing_option: string;

  @IsNotEmpty()
  @IsString()
  redirect_url: string;
}
