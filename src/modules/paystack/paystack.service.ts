import { Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { CreatePaystackPaymentPlanDto } from './dto/create-paystack-payment-plan.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Payment, PaymentStatus } from './entities/payment.entity';
import { CustomHttpException } from '../../helpers/custom-http-filter';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class PaystackService {
  private readonly secretKey: string;
  private readonly baseUrl: string;

  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
    @InjectRepository(Payment)
    private readonly paymentRepo: Repository<Payment>
  ) {
    this.secretKey = configService.get<string>('PAYSTACK_SECRET_KEY');
    this.baseUrl = this.configService.get<string>('PAYSTACK_BASE_URL', 'https://api.paystack.co');
  }

  /**
   * Initializes a payment for a subscription plan.
   */
  async initiatePaymentForPlan(createPaystackPaymentPlanDto: CreatePaystackPaymentPlanDto, userId: string) {
    // Validate email format
    const headers = {
      Authorization: `Bearer ${this.secretKey}`,
      'Content-Type': 'application/json',
    };

    // Fetch plan details from Paystack
    const planResponse = await this.httpService
      .get(`${this.baseUrl}/plan/${createPaystackPaymentPlanDto.plan_id}`, { headers })
      .toPromise();

    if (!planResponse.data || !planResponse.data.status) {
      throw new CustomHttpException('Invalid plan ID or plan not found', 404);
    }

    // Extract plan details
    const { amount } = planResponse.data.data;

    // Construct payment payload
    const paymentData = {
      email: createPaystackPaymentPlanDto.email,
      amount, 
      reference: uuidv4(),
      callback_url: createPaystackPaymentPlanDto.callback_url,
      plan: createPaystackPaymentPlanDto.plan_id,
    };

    // Initiate transaction
    const response = await this.httpService
      .post(`${this.baseUrl}/transaction/initialize`, paymentData, { headers })
      .toPromise();

    if (!response.data.status) {
      throw new CustomHttpException('Failed to initialize payment', 400);
    }

    // Save transaction in DB
    const newPayment = this.paymentRepo.create({
      user_id: userId,
      transaction_id: paymentData.reference,
      gateway_id: '',
      amount: amount / 100, 
      status: PaymentStatus.PENDING,
    });

    await this.paymentRepo.save(newPayment);

    return {
      status: 200,
      message: 'Payment initialized successfully',
      data: {
        payment_url: response.data.data.authorization_url,
        reference: paymentData.reference,
      },
    };
  }

  /**
   * Verifies a payment transaction.
   */
  async verifyPayment(reference: string) {
    const headers = {
      Authorization: `Bearer ${this.secretKey}`,
    };

    const response = await this.httpService
      .get(`${this.baseUrl}/transaction/verify/${reference}`, { headers })
      .toPromise();

    if (!response.data.status) {
      throw new CustomHttpException('Payment verification failed', 400);
    }

    // Update payment status in DB
    const payment = await this.paymentRepo.findOne({ where: { transaction_id: reference } });
    if (payment) {
      payment.status = response.data.data.status === 'success' ? PaymentStatus.APPROVED : PaymentStatus.FAILED;
      await this.paymentRepo.save(payment);
    }

    return {
      status: response.data.data.status,
      message: 'Payment verification APPROVED',
      data: response.data.data,
    };
  }
}
