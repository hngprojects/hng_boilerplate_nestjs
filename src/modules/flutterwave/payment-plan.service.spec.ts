import { Test, TestingModule } from '@nestjs/testing';
import { PaymentPlanService } from './payment-plan.service';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { Repository } from 'typeorm';
import { PaymentPlan } from './entities/payment-plan.entity';
import { getRepositoryToken } from '@nestjs/typeorm';
import { of } from 'rxjs';
import { AxiosResponse } from 'axios';
import { CreatePaymentPlanDto } from './dto/payment-plan.dto';

describe('PaymentPlanService', () => {
  let service: PaymentPlanService;
  let httpService: HttpService;
  let paymentPlanRepo: Repository<PaymentPlan>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PaymentPlanService,
        {
          provide: HttpService,
          useValue: {
            post: jest.fn(),
          },
        },
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn().mockImplementation((key: string) => {
              if (key === 'FLUTTERWAVE_SECRET_KEY') return 'mock-secret-key';
              if (key === 'FLUTTERWAVE_BASE_URL') return 'mock-base-url';
            }),
          },
        },
        {
          provide: getRepositoryToken(PaymentPlan),
          useClass: Repository,
        },
      ],
    }).compile();

    service = module.get<PaymentPlanService>(PaymentPlanService);
    httpService = module.get<HttpService>(HttpService);
    paymentPlanRepo = module.get<Repository<PaymentPlan>>(getRepositoryToken(PaymentPlan));
  });

  it('should create a payment plan successfully', async () => {
    const paymentPlanResponse: AxiosResponse = {
      data: {
        data: {
          id: 'plan-id',
          name: 'Basic Plan',
          amount: 10000,
          duration: 12,
          interval: 'monthly',
        },
      },
      status: 200,
      statusText: 'OK',
      headers: {},
      config: {
        headers: undefined,
      },
    };

    jest.spyOn(httpService, 'post').mockReturnValue(of(paymentPlanResponse));
    jest.spyOn(paymentPlanRepo, 'create').mockImplementation(dto => dto as PaymentPlan);
    jest.spyOn(paymentPlanRepo, 'save').mockResolvedValue({} as PaymentPlan);

    const createPaymentPlanDto: CreatePaymentPlanDto = {
      name: 'Basic Plan',
      amount: 10000,
      duration: 12,
      interval: 'monthly',
      description: 'This is a basic plan',
      features: 'Default plan',
    };

    const paymentPlan = {
      name: 'Basic Plan',
      amount: 10000,
      duration: 12,
      interval: 'monthly',
    };

    const result = await service.create(createPaymentPlanDto);

    expect(result).toEqual({
      status: 200,
      message: 'Payment plan created successfully',
      data: {
        paymentPlan: paymentPlanResponse.data.data,
      },
    });
    expect(httpService.post).toHaveBeenCalledWith('mock-base-url/payment-plans', paymentPlan, {
      headers: service['headers'],
    });
    expect(paymentPlanRepo.create).toHaveBeenCalledWith(createPaymentPlanDto);
    expect(paymentPlanRepo.save).toHaveBeenCalledWith(expect.any(Object));
  });
});
