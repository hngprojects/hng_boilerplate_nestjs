import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { FlutterwaveService } from './flutterwave.service';
import { CreateFlutterwaveDto } from './dto/create-paymentplan.dto';
import { UpdateFlutterwaveDto } from './dto/update-flutterwave.dto';
import { skipAuth } from '../../helpers/skipAuth';

@Controller('payment/flutterwave')
export class FlutterwaveController {
  constructor(private readonly flutterwaveService: FlutterwaveService) {}

  @Post('payment-plan')
  create(@Body() createFlutterwaveDto: CreateFlutterwaveDto) {
    return this.flutterwaveService.createPaymentPlan(createFlutterwaveDto);
  }

  @skipAuth()
  @Get('payment-plan')
  getAllPaymentPlan() {
    return this.flutterwaveService.getAllPaymentPlan();
  }

  @skipAuth()
  @Get('payment-plan/:id')
  getSinglePaymentPlan(@Param() id) {
    return this.flutterwaveService.getSinglePaymentPlan(id);
  }

  @Patch('payment-plan/:id')
  updatePaymentPlan(@Param() id: string, @Body() updateFlutterwaveDto: UpdateFlutterwaveDto) {
    return this.flutterwaveService.updatePaymentPlan(id, updateFlutterwaveDto);
  }

  @Delete('payment-plan/:id')
  cancelPaymentPlan(@Param() id: string) {
    return this.cancelPaymentPlan(id);
  }

  @skipAuth()
  @Post('subscription/:id')
  activateSubscription(@Param() id: string) {
    return this.flutterwaveService.activateSubscription(id);
  }

  @Get('subscription')
  GetAllSubscription() {
    return this.flutterwaveService.getAllSubscription();
  }

  @skipAuth()
  @Post('payment')
  makePayment(@Body() data) {
    return this.flutterwaveService.makePayment(data);
  }
}
