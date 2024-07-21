export class CreateSubscriptionPlanDto {
  name: string;
  description: string;
  price: number;
  duration: string;
  feature: string[];
}
