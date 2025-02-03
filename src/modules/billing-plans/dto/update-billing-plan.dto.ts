import { PartialType } from '@nestjs/mapped-types';
import { BillingPlanDto } from './billing-plan.dto';

export class UpdateBillingPlanDto extends PartialType(BillingPlanDto) {}
