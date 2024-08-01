import { IsNumber, isNumber, IsOptional, IsString, isString } from 'class-validator';

export class CreateFlutterwaveDto {
  @IsString()
  name: string;

  @IsNumber()
  amount: number;

  @IsString()
  interval: string;
}
