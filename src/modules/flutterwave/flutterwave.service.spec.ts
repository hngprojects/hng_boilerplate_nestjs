import { Test, TestingModule } from '@nestjs/testing';
import { FlutterwaveService } from './flutterwave.service';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { Repository } from 'typeorm';
import { Payment, PaymentStatus } from './entities/payment.entity';
import { getRepositoryToken } from '@nestjs/typeorm';
import { of } from 'rxjs';
import { AxiosResponse } from 'axios';
import { CreateFlutterwavePaymentDto } from './dto/create-flutterwave-payment.dto';

describe('FlutterwaveService', () => {
  let service: FlutterwaveService;
  let httpService: HttpService;
  let paymentRepo: Repository<Payment>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        FlutterwaveService,
        {
          provide: HttpService,
          useValue: {
            get: jest.fn(),
            post: jest.fn(),
          },
        },
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn().mockReturnValue('mock-base-url'),
          },
        },
        {
          provide: getRepositoryToken(Payment),
          useClass: Repository,
        },
      ],
    }).compile();

    service = module.get<FlutterwaveService>(FlutterwaveService);
    httpService = module.get<HttpService>(HttpService);
    paymentRepo = module.get<Repository<Payment>>(getRepositoryToken(Payment));
  });

  it('should initiate a payment successfully', async () => {
    const paymentPlanResponse: AxiosResponse = {
      data: {
        data: {
          amount: 5000,
          currency: 'USD',
        },
      },
      status: 200,
      statusText: 'OK',
      headers: {},
      config: {
        headers: undefined,
      },
    };

    jest.spyOn(httpService, 'get').mockReturnValue(of(paymentPlanResponse));

    const paymentInitResponse: AxiosResponse = {
      data: {
        data: {
          link: 'http://payment-link.com',
        },
      },
      status: 200,
      statusText: 'OK',
      headers: {},
      config: {
        headers: undefined,
      },
    };

    jest.spyOn(httpService, 'post').mockReturnValue(of(paymentInitResponse));
    jest.spyOn(paymentRepo, 'create').mockImplementation(dto => dto as Payment);
    jest.spyOn(paymentRepo, 'save').mockResolvedValue({} as Payment);

    const createFlutterwavePaymentDto: CreateFlutterwavePaymentDto = {
      plan_id: 'plan-id',
      email: 'test@example.com',
      first_name: 'first',
      last_name: 'last',
      redirect_url: 'http://redirect-url.com',
      organisation_id: 'org-id',
      billing_option: 'monthly',
    };

    const result = await service.initiatePayment(createFlutterwavePaymentDto);

    expect(result).toEqual({
      status: 200,
      message: 'Payment initiated successfully',
      data: {
        payment_url: 'http://payment-link.com',
      },
    });
    expect(httpService.get).toHaveBeenCalledWith('mock-base-url/payment-plans/plan-id', expect.any(Object));
    expect(httpService.post).toHaveBeenCalledWith('mock-base-url/payments', expect.any(Object), expect.any(Object));
    expect(paymentRepo.create).toHaveBeenCalledWith(
      expect.objectContaining({
        amount: 5000,
        status: PaymentStatus.PENDING,
      })
    );
    expect(paymentRepo.save).toHaveBeenCalled();
  });
});
