import { IsBoolean, IsOptional, IsString } from 'class-validator';

export class DeactivateAccountDto {
  @IsOptional()
  @IsString()
  reason?: string;

  @IsBoolean()
  confirmation: boolean;
}
