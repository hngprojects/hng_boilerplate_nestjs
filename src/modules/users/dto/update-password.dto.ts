// src/users/dto/update-password.dto.ts
import { IsString, MinLength, MaxLength } from 'class-validator';

export class UpdatePasswordDto {
  @IsString()
  @MinLength(6)
  @MaxLength(20)
  oldPassword: string;

  @IsString()
  @MinLength(6)
  @MaxLength(20)
  newPassword: string;
}
