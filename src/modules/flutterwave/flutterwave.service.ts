import { Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { CreateFlutterwavePaymentDto } from './dto/create-flutterwave-payment.dto';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { ConfigService } from '@nestjs/config';
import { CustomHttpException } from '@shared/helpers/custom-http-filter';
import { v4 as uuid4 } from 'uuid';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Payment, PaymentStatus } from './entities/payment.entity';
import { PAYMENT_NOTFOUND } from '@shared/constants/SystemMessages';

@Injectable()
export class FlutterwaveService {
  private readonly secretKey: string;
  private readonly baseUrl: string;

  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
    @InjectRepository(Payment)
    private readonly paymentRepo: Repository<Payment>
  ) {
    this.secretKey = this.configService.get<string>('FLUTTERWAVE_SECRET_KEY');
    this.baseUrl = this.configService.get<string>('FLUTTERWAVE_BASE_URL');
  }

  async initiatePayment(createFlutterwavePaymentDto: CreateFlutterwavePaymentDto, userId: string) {
    const headers = {
      Authorization: `Bearer ${this.secretKey}`,
      'Content-Type': 'application/json',
    };

    const paymentPlanObs = this.httpService.get(
      `${this.baseUrl}/payment-plans/${createFlutterwavePaymentDto.plan_id}`,
      { headers }
    );
    const paymentPlan = await firstValueFrom(paymentPlanObs).catch(() => null);
    if (!paymentPlan || !paymentPlan.data?.data) {
      throw new CustomHttpException(PAYMENT_NOTFOUND, 404);
    }

    const { amount, currency } = paymentPlan.data.data;
    const { email, first_name, last_name } = createFlutterwavePaymentDto;
    const paymentData = {
      tx_ref: uuid4(),
      amount,
      currency,
      redirect_url: createFlutterwavePaymentDto.redirect_url,
      customer: {
        email: email,
        name: `${first_name} ${last_name}`,
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

    const paymentInitObs = this.httpService.post(`${this.baseUrl}/payments`, paymentData, { headers });
    const response = await firstValueFrom(paymentInitObs);

    const createPaymentDto: CreatePaymentDto = {
      user_id: userId,
      transaction_id: uuid4(),
      gateway_id: '',
      amount: paymentData.amount,
      status: PaymentStatus.PENDING,
    };
    const newPayment = this.paymentRepo.create(createPaymentDto);
    await this.paymentRepo.save(newPayment);

    return {
      status: 200,
      message: 'Payment initiated successfully',
      data: {
        payment_url: response.data?.data?.link,
      },
    };
  }

  async verifyPayment(transactionId: string): Promise<any> {
    const headers = {
      Authorization: `Bearer ${this.secretKey}`,
      'Content-Type': 'application/json',
    };

    const verifyObs = this.httpService.get(`${this.baseUrl}/transactions/${transactionId}/verify`, { headers });
    const response = await firstValueFrom(verifyObs);

    const payment = await this.paymentRepo.findOne({
      where: { transaction_id: transactionId },
    });
    if (!payment) {
      throw new CustomHttpException(PAYMENT_NOTFOUND, 404);
    }
    payment.status = PaymentStatus.APPROVED;
    await this.paymentRepo.save(payment);

    return {
      status: 200,
      message: 'Payment verified successfully',
      data: {
        paymentStatus: response.data?.data,
      },
    };
  }
}
