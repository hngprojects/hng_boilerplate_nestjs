import { Module } from '@nestjs/common';
import { PricingPlanService } from './pricing-plan.service';
import { PricingPlanController } from './pricing-plan.controller';

@Module({
  controllers: [PricingPlanController],
  providers: [PricingPlanService],
})
export class PricingPlanModule {}
