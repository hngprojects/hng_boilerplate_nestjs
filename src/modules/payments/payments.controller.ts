import { Controller, Get, Post, Body, Patch, Param, Delete, Request, Query, Res } from '@nestjs/common';
import { PaymentsService } from './payments.service';
import { CreateSubscriptionDto } from './dto/create-subscription.dto';
import { skipAuth } from 'src/helpers/skipAuth';
import { Response } from 'express';

@Controller('payments')
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  @Post('paystack')
  async initializePaystackPyament(@Body() createSubscriptionDto: CreateSubscriptionDto, @Request() req: any) {
    const user = req.user;
    const subscription = await this.paymentsService.createSubscription(createSubscriptionDto, user.sub);
    return subscription;
  }

  @skipAuth()
  @Get('paystack/verify')
  async verifyPaystackPyament(
    @Query('trxref') trxref: string,
    @Query('subscriptionId') subscriptionId: string,
    @Res() res: Response
  ) {
    const verificationResult = await this.paymentsService.verifyPayStackPayment(trxref, subscriptionId);

    console.log({ trxref, subscriptionId });
    const redirectUrl = `https://example.com?success=${verificationResult.data.status}`;

    return res.redirect(redirectUrl);
  }
}
