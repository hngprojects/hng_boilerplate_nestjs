import { Test, TestingModule } from '@nestjs/testing';
import { PaymentsService } from '../payments.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { User } from '../../user/entities/user.entity';
import { Subscription } from '../entities/subscription.entity';
import { BillingPlan } from '../../billing-plans/entities/billing-plan.entity';
import { Repository } from 'typeorm';
import axios from 'axios';
import { HttpException, HttpStatus, NotFoundException } from '@nestjs/common';
import { Organisation } from '../../organisations/entities/organisations.entity';

jest.mock('axios');

describe('PaymentsService', () => {
  let service: PaymentsService;
  let userRepository: Repository<User>;
  let subscriptionRepository: Repository<Subscription>;
  let billingPlanRepository: Repository<BillingPlan>;
  let organisationRepository: Repository<Organisation>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PaymentsService,
        {
          provide: getRepositoryToken(User),
          useClass: Repository,
        },
        {
          provide: getRepositoryToken(Subscription),
          useClass: Repository,
        },
        {
          provide: getRepositoryToken(BillingPlan),
          useClass: Repository,
        },
        {
          provide: getRepositoryToken(Organisation),
          useClass: Repository,
        },
      ],
    }).compile();

    service = module.get<PaymentsService>(PaymentsService);
    userRepository = module.get<Repository<User>>(getRepositoryToken(User));
    subscriptionRepository = module.get<Repository<Subscription>>(getRepositoryToken(Subscription));
    billingPlanRepository = module.get<Repository<BillingPlan>>(getRepositoryToken(BillingPlan));
    organisationRepository = module.get<Repository<Organisation>>(getRepositoryToken(Organisation));
  });

  describe('createSubscription', () => {
    it('should throw a NotFoundException if the user is not found', async () => {
      jest.spyOn(userRepository, 'findOne').mockResolvedValueOnce(null);

      await expect(service.createSubscription({} as any, 'user-id')).rejects.toThrow(NotFoundException);
    });

    it('should throw a NotFoundException if the billing plan is not found', async () => {
      jest.spyOn(userRepository, 'findOne').mockResolvedValueOnce(new User());
      jest.spyOn(billingPlanRepository, 'findOneBy').mockResolvedValueOnce(null);

      await expect(service.createSubscription({ plan_id: 'plan-id' } as any, 'user-id')).rejects.toThrow(
        NotFoundException
      );
    });

    it('should throw a NotFoundException if the organisation is not found', async () => {
      jest.spyOn(userRepository, 'findOne').mockResolvedValueOnce(new User());
      jest.spyOn(billingPlanRepository, 'findOneBy').mockResolvedValueOnce(new BillingPlan());
      jest.spyOn(organisationRepository, 'findOneBy').mockResolvedValueOnce(null);

      await expect(
        service.createSubscription({ plan_id: 'plan-id', organization_id: 'org-id' } as any, 'user-id')
      ).rejects.toThrow(NotFoundException);
    });

    it('should initiate a payment with Paystack and return the payment URL', async () => {
      const user = new User();
      user.email = 'test@example.com';
      const billingPlan = new BillingPlan();
      billingPlan.name = 'Test Plan';
      billingPlan.price = 2000;

      jest.spyOn(userRepository, 'findOne').mockResolvedValueOnce(user);
      jest.spyOn(billingPlanRepository, 'findOneBy').mockResolvedValueOnce(billingPlan);
      jest.spyOn(organisationRepository, 'findOneBy').mockResolvedValueOnce(new Organisation());
      jest.spyOn(subscriptionRepository, 'create').mockReturnValueOnce(new Subscription());
      jest.spyOn(subscriptionRepository, 'save').mockResolvedValueOnce(new Subscription());

      (axios.post as jest.Mock).mockResolvedValueOnce({
        data: {
          data: {
            plan_code: 'plan-code',
          },
        },
      });

      (axios.post as jest.Mock).mockResolvedValueOnce({
        data: {
          data: {
            authorization_url: 'http://paystack.com',
          },
        },
      });

      const result = await service.createSubscription(
        { plan_id: 'plan-id', organization_id: 'org-id', billing_option: 'monthly' } as any,
        'user-id'
      );

      expect(userRepository.findOne).toHaveBeenCalledWith({ where: { id: 'user-id' } });
      expect(billingPlanRepository.findOneBy).toHaveBeenCalledWith({ id: 'plan-id' });
      expect(organisationRepository.findOneBy).toHaveBeenCalledWith({ id: 'org-id' });
      expect(subscriptionRepository.create).toHaveBeenCalled();
      expect(subscriptionRepository.save).toHaveBeenCalled();
      expect(result).toEqual({
        status: 'success',
        status_code: 200,
        message: 'Payment initiated successfully',
        data: {
          payment_url: 'http://paystack.com',
        },
      });
    });

    it('should handle internal server errors', async () => {
      jest.spyOn(userRepository, 'findOne').mockImplementation(() => {
        throw new Error('Database error');
      });

      await expect(service.createSubscription({} as any, 'user-id')).rejects.toThrow(
        new HttpException(
          {
            message: 'Internal server error: Database error',
            status_code: HttpStatus.INTERNAL_SERVER_ERROR,
          },
          HttpStatus.INTERNAL_SERVER_ERROR
        )
      );
    });
  });

  describe('verifyPayStackPayment', () => {
    it('should update the subscription status to active if the payment is successful', async () => {
      const subscription = new Subscription();
      subscription.status = 'inactive';
      jest.spyOn(subscriptionRepository, 'findOne').mockResolvedValueOnce(subscription);
      jest.spyOn(subscriptionRepository, 'save').mockResolvedValueOnce(new Subscription());

      (axios.get as jest.Mock).mockResolvedValueOnce({ data: { data: { status: 'success' } } });

      const result = await service.verifyPayStackPayment('transaction-ref', 'subscription-id');

      expect(subscription.status).toBe('active');
      expect(subscription.transactionRef).toBe('transaction-ref');
      expect(subscriptionRepository.save).toHaveBeenCalledWith(
        expect.objectContaining({ status: 'active', transactionRef: 'transaction-ref' })
      );
      expect(result).toEqual({
        message: 'Payment successful',
        data: { status: 'success' },
      });
    });

    it('should return a failed message if the payment is not successful', async () => {
      jest.spyOn(subscriptionRepository, 'findOne').mockResolvedValueOnce(new Subscription());

      (axios.get as jest.Mock).mockResolvedValueOnce({ data: { data: { status: 'failed' } } });

      const result = await service.verifyPayStackPayment('transaction-ref', 'subscription-id');

      expect(result).toEqual({ message: 'Payment failed', data: { status: 'failed' } });
    });

    it('should handle errors from Paystack API', async () => {
      jest.spyOn(subscriptionRepository, 'findOne').mockResolvedValueOnce(new Subscription());
      (axios.get as jest.Mock).mockRejectedValueOnce(new Error('Paystack API error'));

      const result = await service.verifyPayStackPayment('transaction-ref', 'subscription-id');

      expect(result).toEqual({
        message: 'Payment failed',
        data: { status: 'failed' },
      });
    });
  });
});
