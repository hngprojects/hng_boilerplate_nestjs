import { Module } from '@nestjs/common';
import { FlutterwaveService } from './flutterwave.service';
import { FlutterwaveController } from './flutterwave.controller';
import { HttpModule } from '@nestjs/axios';
import { Payment } from './entities/payment.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PaymentPlanController } from './payment-plan.controller';
import { PaymentPlanService } from './payment-plan.service';
import { PaymentPlan } from './entities/payment-plan.entity';

@Module({
  imports: [HttpModule, TypeOrmModule.forFeature([Payment, PaymentPlan])],
  controllers: [FlutterwaveController, PaymentPlanController],
  providers: [FlutterwaveService, PaymentPlanService],
})
export class FlutterwaveModule {}
