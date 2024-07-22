import { IsEmail, IsString, Length } from 'class-validator';

export class RequestSignInTokenDto {
  @IsEmail()
  email: string;
}

export class VerifySignInTokenDto {
  @IsEmail()
  email: string;

  @IsString()
  @Length(6, 6)
  token: string;
}
