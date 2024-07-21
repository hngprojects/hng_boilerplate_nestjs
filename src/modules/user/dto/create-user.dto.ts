import { IsString, IsEmail, IsNotEmpty, IsBoolean, IsOptional, IsUUID } from 'class-validator';

export class CreateUserDto {
  @IsString()
  @IsNotEmpty()
  first_name: string;

  @IsString()
  @IsNotEmpty()
  last_name: string;

  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsString()
  @IsNotEmpty()
  password: string;

  @IsBoolean()
  @IsOptional()
  is_active?: boolean;

  @IsOptional()
  attempts_left?: number;

  @IsOptional()
  time_left?: number;
}
