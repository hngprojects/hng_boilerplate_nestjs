import { IsNumber, isNumber, IsOptional, IsString, isString } from 'class-validator';

export class CreateFlutterwaveDto {
  @IsString()
  name: string;

  @IsNumber()
  price: number;

  @IsString()
  description: string;
}
