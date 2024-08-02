import { Module } from '@nestjs/common';
import { PaymentsService } from './payments.service';
import { PaymentsController } from './payments.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '../user/entities/user.entity';
import { Subscription } from './entities/subscription.entity';
import { BillingPlan } from '../billing-plans/entities/billing-plan.entity';
import { Organisation } from '../organisations/entities/organisations.entity';

@Module({
  imports: [TypeOrmModule.forFeature([User, Subscription, BillingPlan, Organisation])],
  controllers: [PaymentsController],
  providers: [PaymentsService],
})
export class PaymentsModule {}
