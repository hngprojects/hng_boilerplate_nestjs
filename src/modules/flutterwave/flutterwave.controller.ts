import { Controller, Get, Post, Body, Patch, Param, Delete, Req } from '@nestjs/common';
import { FlutterwaveService } from './flutterwave.service';
import { CreateFlutterwavePaymentDto } from './dto/create-flutterwave-payment.dto';
import { UserPayload } from '../user/interfaces/user-payload.interface';

@Controller('payments/flutterwave')
export class FlutterwaveController {
  constructor(private readonly flutterwaveService: FlutterwaveService) {}

  @Post()
  initiate(@Body() createFlutterwavePaymentDto: CreateFlutterwavePaymentDto, @Req() req: { user: UserPayload }) {
    const userId = req.user.id;
    return this.flutterwaveService.initiatePayment(createFlutterwavePaymentDto, userId);
  }

  @Get('verify/:id')
  verify(@Param() id: string) {
    return this.flutterwaveService.verifyPayment(id);
  }
}
