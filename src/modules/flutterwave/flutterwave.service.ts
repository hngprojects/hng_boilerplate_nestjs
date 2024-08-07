import { Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { CreateFlutterwavePaymentDto } from './dto/create-flutterwavePaymentDto';
import { CreatePaymentDto } from './dto/create-paymentDto';
import { ConfigService } from '@nestjs/config';
import { CustomHttpException } from '../../helpers/custom-http-filter';
import { v4 as uuid4 } from 'uuid';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Payment, PaymentStatus } from './entities/payment.entity';

@Injectable()
export class FlutterwaveService {
  private readonly secretkey: string;
  private readonly baseUrl: string;
  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
    @InjectRepository(Payment)
    private readonly paymentRepo: Repository<Payment>
  ) {
    this.secretkey = configService.get<string>('FLUTTERWAVE_SECRET_KEY');
    this.baseUrl = configService.get<string>('FLUTTERWAVE_BASE_URL');
  }

  async initiatePayment(createFlutterwavePaymentDto: CreateFlutterwavePaymentDto): Promise<any> {
    const headers = {
      Authorization: `Bearer ${this.secretkey}`,
      'Content-Type': 'application/json',
    };
    const payment_plan = await this.httpService
      .get(`${this.baseUrl}/payment-plans/${createFlutterwavePaymentDto.plan_id}`, { headers })
      .toPromise();
    if (!payment_plan) {
      return new CustomHttpException('Payment plan not found', 404).getResponse();
    }
    const paymentData = {
      tx_ref: uuid4(),
      amount: payment_plan.data.data.amount,
      currency: payment_plan.data.data.currency,
      redirect_url: createFlutterwavePaymentDto.redirect_url,
      customer: {
        email: createFlutterwavePaymentDto.email,
        name: createFlutterwavePaymentDto.full_name,
      },
      customizations: {
        title: 'Payment for Goods/Services',
        description: 'Payment for the purchase of goods or services',
      },
      meta: {
        organization_id: createFlutterwavePaymentDto.organisation_id,
        plan_id: createFlutterwavePaymentDto.plan_id,
        billing_option: createFlutterwavePaymentDto.billing_option,
      },
    };
    const response = await this.httpService.post(`${this.baseUrl}/payments`, paymentData, { headers }).toPromise();
    const createPaymentDto: CreatePaymentDto = {
      user_id: '',
      transaction_id: uuid4(),
      gateway_id: '',
      amount: paymentData.amount,
      status: PaymentStatus.PENDING,
    };
    const newPayment = await this.paymentRepo.create(createPaymentDto);
    await this.paymentRepo.save(newPayment);
    return {
      status: 200,
      message: 'Payment initiated successfully',
      data: {
        payment_url: response.data.data.link,
      },
    };
  }

  async verifyPayment(transactionId: string): Promise<any> {
    const headers = {
      Authorization: `Bearer ${this.secretkey}`,
      'Content-Type': 'application/json',
    };
    const response = await this.httpService
      .get(`${this.baseUrl}/transactions/${transactionId}/verify`, { headers })
      .toPromise();
    return {
      status: 200,
      message: 'Payment verified successfully',
      data: {
        paymentStatus: response.data.data,
      },
    };
  }
}
