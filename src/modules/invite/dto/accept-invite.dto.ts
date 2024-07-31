import { IsString, IsNotEmpty, IsEmail, IsOptional } from 'class-validator';

export class AcceptInviteDto {
  @IsString()
  @IsNotEmpty()
  token: string;

  @IsEmail()
  @IsOptional()
  email?: string;
}
