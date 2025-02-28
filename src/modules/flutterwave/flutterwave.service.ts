import { Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { CreateFlutterwavePaymentDto } from './dto/create-flutterwave-payment.dto';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { ConfigService } from '@nestjs/config';
import { CustomHttpException } from '@shared/helpers/custom-http-filter';
import { v4 as uuid4 } from 'uuid';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Payment, PaymentStatus } from './entities/payment.entity';
import { BILLING_PLAN_NOT_FOUND, PAYMENT_NOTFOUND } from '@shared/constants/SystemMessages';
import { BillingPlan } from '@modules/billing-plans/entities/billing-plan.entity';

@Injectable()
export class FlutterwaveService {
  private readonly secretkey: string;
  private readonly baseUrl: string;
  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
    @InjectRepository(Payment)
    private readonly paymentRepo: Repository<Payment>,
    @InjectRepository(BillingPlan)
    private readonly billingPlanRepository: Repository<BillingPlan>
  ) {
    this.secretkey = configService.get<string>('FLUTTERWAVE_SECRET_KEY');
    this.baseUrl = configService.get<string>('FLUTTERWAVE_BASE_URL');
  }

  async initiatePayment(createFlutterwavePaymentDto: CreateFlutterwavePaymentDto, userId: string) {
    const headers = {
      Authorization: `Bearer ${this.secretkey}`,
      'Content-Type': 'application/json',
    };
    const billingPlan = await this.billingPlanRepository.findOneBy({ id: createFlutterwavePaymentDto.plan_id });
    if (!billingPlan) {
      throw new CustomHttpException(BILLING_PLAN_NOT_FOUND, 404);
    }
    let flutterwavePlanId = billingPlan.flutterwave_plan_id;
    if (!flutterwavePlanId) {
      const flutterwavePlan = await this.httpService
        .post(
          `${this.baseUrl}/payment-plans`,
          {
            name: billingPlan.name,
            amount: billingPlan.amount,
            interval: billingPlan.frequency,
            duration: 24,
          },
          { headers }
        )
        .toPromise();
      billingPlan.flutterwave_plan_id = flutterwavePlan.data.data.id;
      await this.billingPlanRepository.save(billingPlan);
      flutterwavePlanId = billingPlan.flutterwave_plan_id;
    }
    let paymentPlan = await this.httpService
      .get(`${this.baseUrl}/payment-plans/${flutterwavePlanId}`, { headers })
      .toPromise();
    if (!paymentPlan) {
      const newPaymentPlan = await this.httpService
        .post(
          `${this.baseUrl}/payment-plans`,
          {
            name: billingPlan.name,
            amount: billingPlan.amount,
            interval: billingPlan.frequency,
            duration: 24,
          },
          { headers }
        )
        .toPromise();
      billingPlan.flutterwave_plan_id = newPaymentPlan.data.data.id;
      await this.billingPlanRepository.save(billingPlan);
      paymentPlan = newPaymentPlan;
    }
    const { amount, currency } = paymentPlan.data.data;
    const { email, first_name, last_name } = createFlutterwavePaymentDto;
    const paymentData = {
      tx_ref: uuid4(),
      amount: amount,
      currency: currency,
      redirect_url: createFlutterwavePaymentDto.redirect_url,
      customer: {
        email: email,
        name: `${first_name} ${last_name}`,
      },
      customizations: {
        title: billingPlan.name,
        description: billingPlan.description,
      },
      meta: {
        organization_id: createFlutterwavePaymentDto.organisation_id,
        plan_id: createFlutterwavePaymentDto.plan_id,
        billing_option: createFlutterwavePaymentDto.billing_option,
      },
    };
    const response = await this.httpService.post(`${this.baseUrl}/payments`, paymentData, { headers }).toPromise();
    const createPaymentDto: CreatePaymentDto = {
      user_id: userId,
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
    const payment = await this.paymentRepo.findOne({ where: { transaction_id: transactionId } });
    payment.status = PaymentStatus.APPROVED;
    await this.paymentRepo.save(payment);
    return {
      status: 200,
      message: 'Payment verified successfully',
      data: {
        paymentStatus: response.data.data,
      },
    };
  }
}
