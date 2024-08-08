import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { PaymentPlan } from './entities/payment-plan.entity';
import { Repository } from 'typeorm';
import { CreatePaymentPlanDto } from './dto/payment-plan.dto';
import { ConfigService } from '@nestjs/config';
import { HttpService } from '@nestjs/axios';

@Injectable()
export class PaymentPlanService {
  private readonly secretkey: string;
  private readonly baseUrl: string;
  private readonly headers: {};
  constructor(
    @InjectRepository(PaymentPlan)
    private readonly paymentPlanRepo: Repository<PaymentPlan>,
    private readonly httpService: HttpService,
    private readonly configService: ConfigService
  ) {
    this.secretkey = configService.get<string>('FLUTTERWAVE_SECRET_KEY');
    this.baseUrl = configService.get<string>('FLUTTERWAVE_BASE_URL');
    this.headers = {
      Authorization: `Bearer ${this.secretkey}`,
      'Content-Type': 'application/json',
    };
  }

  async create(createPaymentPlanDto: CreatePaymentPlanDto) {
    const { name, amount, duration, interval } = createPaymentPlanDto;
    const paymentPlan = {
      name,
      amount,
      duration,
      interval,
    };
    const response = await this.httpService
      .post(`${this.baseUrl}/payment-plans`, paymentPlan, { headers: this.headers })
      .toPromise();
    const payment_plan = await this.paymentPlanRepo.create(createPaymentPlanDto);
    await this.paymentPlanRepo.save(payment_plan);
    return {
      status: 200,
      message: 'Payment plan created successfully',
      data: {
        paymentPlan: response.data.data,
      },
    };
  }
}
