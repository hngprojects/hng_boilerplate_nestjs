import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { FlutterwaveService } from './flutterwave.service';
import { CreateFlutterwaveDto } from './dto/create-flutterwave.dto';
import { UpdateFlutterwaveDto } from './dto/update-flutterwave.dto';
import { skipAuth } from 'src/helpers/skipAuth';

@Controller('payment/flutterwave')
export class FlutterwaveController {
  constructor(private readonly flutterwaveService: FlutterwaveService) {}

  @Post()
  create(@Body() createFlutterwaveDto: CreateFlutterwaveDto) {
    return this.flutterwaveService.createPaymentPlan(createFlutterwaveDto);
  }

  @skipAuth()
  @Get()
  getAllPaymentPlan() {
    return this.flutterwaveService.getAllPaymentPlan();
  }

  @skipAuth()
  @Get(':id')
  getSinglePaymentPlan(@Param() id) {
    return this.flutterwaveService.getSinglePaymentPlan(id);
  }

  @Patch(':id')
  updatePaymentPlan(@Param() id: string, @Body() updateFlutterwaveDto: UpdateFlutterwaveDto) {
    return this.flutterwaveService.updatePaymentPlan(id, updateFlutterwaveDto);
  }

  @Delete(':id')
  cancelPaymentPlan(@Param() id: string) {
    return this.cancelPaymentPlan(id);
  }

  @skipAuth()
  @Post('subscription/:id')
  activateSubscription(@Param() id: string) {
    return this.flutterwaveService.activateSubscription(id)
  }
  @Get('subscription')

  GetAllSubscription() {
    return this.flutterwaveService.getAllSubscription()
  }
}
