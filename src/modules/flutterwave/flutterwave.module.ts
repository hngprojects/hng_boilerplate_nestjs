import { Module } from '@nestjs/common';
import { FlutterwaveService } from './flutterwave.service';
import { FlutterwaveController } from './flutterwave.controller';
import { HttpModule } from '@nestjs/axios';
import { Payment } from './entities/payment.entity';
import { BillingPlan } from '@modules/billing-plans/entities/billing-plan.entity';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  imports: [HttpModule, TypeOrmModule.forFeature([Payment, BillingPlan])],
  controllers: [FlutterwaveController],
  providers: [FlutterwaveService],
})
export class FlutterwaveModule {}
