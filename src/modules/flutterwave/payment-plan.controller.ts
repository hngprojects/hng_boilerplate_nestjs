import { Body, Controller, Post } from '@nestjs/common';
import { PaymentPlanService } from './payment-plan.service';
import { CreatePaymentPlanDto } from './dto/payment-plan.dto';

@Controller('payment/flutterwave/plan')
export class PaymentPlanController {
  constructor(private readonly paymentPlanService: PaymentPlanService) {}

  @Post()
  async create(@Body() createPaymentPlanDto: CreatePaymentPlanDto) {
    return this.paymentPlanService.create(createPaymentPlanDto);
  }
}
