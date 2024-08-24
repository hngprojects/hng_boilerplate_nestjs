import { Module } from '@nestjs/common';
import { BillingPlanService } from './billing-plan.service';
import { BillingPlanController } from './billing-plan.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BillingPlan } from './entities/billing-plan.entity';
import { User } from '../user/entities/user.entity';

@Module({
  imports: [TypeOrmModule.forFeature([BillingPlan, User])],
  controllers: [BillingPlanController],
  providers: [BillingPlanService],
})
export class BillingPlanModule {}
