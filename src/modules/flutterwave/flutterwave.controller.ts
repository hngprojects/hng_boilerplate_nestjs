import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { FlutterwaveService } from './flutterwave.service';
import { CreateFlutterwavePaymentDto } from './dto/create-flutterwavePaymentDto';

@Controller('payments/flutterwave')
export class FlutterwaveController {
  constructor(private readonly flutterwaveService: FlutterwaveService) {}

  @Post()
  initiate(@Body() createFlutterwavePaymentDto: CreateFlutterwavePaymentDto) {
    return this.flutterwaveService.initiatePayment(createFlutterwavePaymentDto);
  }

  @Get('verify/:id')
  verify(@Param() id: string) {
    return this.flutterwaveService.verifyPayment(id);
  }
}
