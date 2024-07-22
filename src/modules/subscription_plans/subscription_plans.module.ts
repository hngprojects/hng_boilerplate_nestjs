import { Module } from '@nestjs/common';
import { SubscriptionPlansService } from './subscription_plans.service';
import { SubscriptionPlansController } from './subscription_plans.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SubscriptionPlan } from '../../database/entities/subscription_plan.entity';
import { FeaturesModule } from 'src/modules/features/features.module';

@Module({
  imports: [TypeOrmModule.forFeature([SubscriptionPlan]), FeaturesModule],
  controllers: [SubscriptionPlansController],
  providers: [SubscriptionPlansService],
  exports: [TypeOrmModule],
})
export class SubscriptionPlansModule {}
