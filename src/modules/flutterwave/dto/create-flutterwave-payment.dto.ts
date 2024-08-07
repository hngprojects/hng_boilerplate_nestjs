import { IsEmail, IsEmpty, IsNotEmpty, IsString, IsUUID } from 'class-validator';

export class CreateFlutterwavePaymentDto {
  @IsNotEmpty()
  @IsEmail()
  email: string;

  @IsNotEmpty()
  @IsUUID()
  organisation_id: string;

  @IsNotEmpty()
  @IsString()
  plan_id: string;

  @IsNotEmpty()
  @IsString()
  first_name: string;

  @IsNotEmpty()
  @IsString()
  last_name: string;

  @IsNotEmpty()
  @IsString()
  billing_option: string;

  @IsNotEmpty()
  @IsString()
  redirect_url: string;
}
