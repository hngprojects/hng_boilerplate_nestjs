import { IsBoolean, IsOptional, IsString } from 'class-validator';

export class DeactivateAccountDto {
  @IsBoolean()
  confirmation: boolean;

  @IsString()
  @IsOptional()
  reason?: string;
}
