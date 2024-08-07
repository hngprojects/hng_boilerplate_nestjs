import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { FlutterwaveService } from './flutterwave.service';
import { UpdateFlutterwaveDto } from './dto/update-flutterwave.dto';
import { CreateFlutterwavePaymentDto } from './dto/create-flutterwavePaymentDto';
import { skipAuth } from 'src/helpers/skipAuth';

@skipAuth()
@Controller('payments/flutterwave')
export class FlutterwaveController {
  constructor(private readonly flutterwaveService: FlutterwaveService) {}

  @Post()
  create(@Body() createFlutterwavePaymentDto: CreateFlutterwavePaymentDto) {
    return this.flutterwaveService.initiatePayment(createFlutterwavePaymentDto);
  }

  @Get('verify/:id')
  verify(@Param() id: string) {
    return this.flutterwaveService.verifyPayment(id);
  }
}
