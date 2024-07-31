import { Module } from '@nestjs/common';
import { BillingPlanService } from './billing-plan.service';
import { BillingPlanController } from './billing-plan.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BillingPlan } from './entities/billing-plan.entity';

@Module({
  imports: [TypeOrmModule.forFeature([BillingPlan])],
  controllers: [BillingPlanController],
  providers: [BillingPlanService],
})
export class BillingPlanModule {}
