import { Controller, Get, Post, Body, Request, Query, Res } from '@nestjs/common';
import { PaymentsService } from './payments.service';
import { CreateSubscriptionDto } from './dto/create-subscription.dto';
import { skipAuth } from 'src/helpers/skipAuth';
import { Response } from 'express';
import {
  ApiBadRequestResponse,
  ApiBody,
  ApiInternalServerErrorResponse,
  ApiOkResponse,
  ApiOperation,
  ApiUnprocessableEntityResponse,
} from '@nestjs/swagger';

@Controller('payments')
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  @ApiOperation({ summary: 'Initiate payment with paystack' })
  @ApiBody({
    type: CreateSubscriptionDto,
    description: 'Initiate Payment Body',
  })
  @ApiOkResponse({
    status: 200,
    description: 'Payment initiated successfully',
  })
  @ApiBadRequestResponse({ status: 400, description: 'Invalid request body' })
  @ApiInternalServerErrorResponse({ status: 500, description: 'Internal server error' })
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
    @Query('redirect_url') redirectURL: string,
    @Res() res: Response
  ) {
    const verificationResult = await this.paymentsService.verifyPayStackPayment(trxref, subscriptionId);
    const redirectUrl = `${redirectURL}?status=${verificationResult.data.status}`;
    return res.redirect(redirectUrl);
  }
}
