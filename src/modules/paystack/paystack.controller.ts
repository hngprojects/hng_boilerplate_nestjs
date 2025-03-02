import { Controller, Get, Post, Body, Param, Req, UnauthorizedException } from '@nestjs/common';
import { PaystackService } from './paystack.service';
import { CreatePaystackPaymentPlanDto } from './dto/create-paystack-payment-plan.dto';
import { UserPayload } from '../user/interfaces/user-payload.interface';
import * as crypto from 'crypto';

@Controller('payments/paystack')
export class PaystackController {
  constructor(private readonly paystackService: PaystackService) {}

  @Post('initialize')
  initiate(@Body() createPaystackPaymentDto: CreatePaystackPaymentPlanDto, @Req() req: { user: UserPayload }) {
    if (!req.user?.id) {
      throw new UnauthorizedException('User is unauthorized, kindly authenticate to continue.');
    }
    return this.paystackService.initiatePaymentForPlan(createPaystackPaymentDto, req.user.id);
  }

  @Get('verify/:reference')
  verify(@Param('reference') reference: string, @Req() req: { user: UserPayload }) {
    if (!req.user) {
      throw new UnauthorizedException('User is unauthorized, kindly authenticate to continue.');
    }
    return this.paystackService.verifyPayment(reference);
  }

  @Post('webhook')
  handleWebhook(@Body() body: any, @Req() req: { headers: Record<string, string> }) {
    const paystackSecret = process.env.PAYSTACK_WEBHOOK_SECRET;
    if (!paystackSecret) {
      throw new Error('Webhook secret is not configured');
    }

    const expectedSignature = crypto.createHmac('sha512', paystackSecret).update(JSON.stringify(body)).digest('hex');

    if (req.headers['x-paystack-signature'] !== expectedSignature) {
      throw new Error('Invalid webhook signature');
    }

    console.log('Valid Paystack webhook received:', body.event);
    return { status: 'success' };
  }
}
