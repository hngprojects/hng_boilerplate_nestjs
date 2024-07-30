import { IsNotEmpty } from 'class-validator';

export class CreatePricingPlanDto {
  @IsNotEmpty()
  name: string;

  @IsNotEmpty()
  price: string;

  @IsNotEmpty()
  description: string;

  @IsNotEmpty()
  features: string;
}
