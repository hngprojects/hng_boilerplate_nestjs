import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { FlutterwaveService } from './flutterwave.service';
import { CreateFlutterwaveDto } from './dto/create-flutterwave.dto';
import { UpdateFlutterwaveDto } from './dto/update-flutterwave.dto';

@Controller('payment/flutterwave')
export class FlutterwaveController {
  constructor(private readonly flutterwaveService: FlutterwaveService) {}

  @Post()
  create(@Body() createFlutterwaveDto: CreateFlutterwaveDto) {
    return this.flutterwaveService.create(createFlutterwaveDto);
  }
}
