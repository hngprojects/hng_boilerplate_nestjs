import { Test, TestingModule } from '@nestjs/testing';
import { PaystackService } from './paystack.service';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { Repository } from 'typeorm';
import { Payment } from './entities/payment.entity';
import { getRepositoryToken } from '@nestjs/typeorm';
import { CreatePaystackPaymentPlanDto } from './dto/create-paystack-payment-plan.dto';
import { of } from 'rxjs';

describe('PaystackService', () => {
  let paystackService: PaystackService;
  let httpService: HttpService;
  let configService: ConfigService;
  let paymentRepo: Repository<Payment>;

  const mockPaymentRepo = {
    create: jest.fn().mockImplementation((dto) => dto),
    save: jest.fn(),
    findOne: jest.fn(),
  };

  const mockHttpService = {
    get: jest.fn(),
    post: jest.fn(),
  };

  const mockConfigService = {
    get: jest.fn((key: string) => {
      switch (key) {
        case 'PAYSTACK_SECRET_KEY':
          return 'test_secret_key';
        case 'PAYSTACK_BASE_URL':
          return 'https://api.paystack.co';
        default:
          return null;
      }
    }),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PaystackService,
        { provide: HttpService, useValue: mockHttpService },
        { provide: ConfigService, useValue: mockConfigService },
        { provide: getRepositoryToken(Payment), useValue: mockPaymentRepo },
      ],
    }).compile();

    paystackService = module.get<PaystackService>(PaystackService);
    httpService = module.get<HttpService>(HttpService);
    configService = module.get<ConfigService>(ConfigService);
    paymentRepo = module.get<Repository<Payment>>(getRepositoryToken(Payment));
  });

  it('should be defined', () => {
    expect(paystackService).toBeDefined();
  });

  describe('initiatePaymentForPlan', () => {
    it('should successfully initialize payment', async () => {
      const createPaymentDto: CreatePaystackPaymentPlanDto = {
        email: 'user@example.com',
        plan_id: 'PLAN_ABC123',
        callback_url: 'https://callback.com',
        organisation_id: 'ORG_001',
        first_name: 'John',
        last_name: 'Doe',
        billing_option: 'monthly',
      };
      const userId = 'user123';

      const mockPlanResponse = {
        data: { status: true, data: { amount: 5000 } },
      };

      const mockInitResponse = {
        data: {
          status: true,
          data: {
            authorization_url: 'https://paystack.com/pay/test',
            reference: '47bc4d22-f976-4d1d-9f96-9ac57ceab3b2',
          },
        },
      };

      jest.spyOn(httpService, 'get').mockReturnValue(of(mockPlanResponse) as any);
      jest.spyOn(httpService, 'post').mockReturnValue(of(mockInitResponse) as any);
      jest.spyOn(paymentRepo, 'save').mockResolvedValue(null);

      const result = await paystackService.initiatePaymentForPlan(createPaymentDto, userId);

      expect(result).toEqual(
        expect.objectContaining({
          status: 200,
          message: 'Payment initialized successfully',
          data: expect.objectContaining({
            payment_url: 'https://paystack.com/pay/test',
            reference: expect.any(String),
          }),
        })
      );

      expect(httpService.get).toHaveBeenCalledWith(
        'https://api.paystack.co/plan/PLAN_ABC123',
        { headers: { Authorization: 'Bearer test_secret_key', 'Content-Type': 'application/json' } }
      );
      expect(httpService.post).toHaveBeenCalled();
      expect(paymentRepo.save).toHaveBeenCalled();
    });
  });

  describe('verifyPayment', () => {
    it('should successfully verify a payment and update status', async () => {
      const reference = 'dynamic-ref-id';
      const mockVerifyResponse = {
        data: {
          status: true,
          data: {
            status: 'success',
          },
        },
      };

      jest.spyOn(httpService, 'get').mockReturnValue(of(mockVerifyResponse) as any);

      const result = await paystackService.verifyPayment(reference);

      expect(result).toEqual(
        expect.objectContaining({
          status: 'success',
          message: 'Payment verification APPROVED',
          data: mockVerifyResponse.data.data,
        })
      );
    });
  });
});
