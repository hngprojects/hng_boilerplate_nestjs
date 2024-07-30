import { PartialType } from '@nestjs/mapped-types';
import { CreatePricingPlanDto } from './create-pricing-plan.dto';

export class UpdatePricingPlanDto extends PartialType(CreatePricingPlanDto) {}
