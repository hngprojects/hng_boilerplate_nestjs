import { Test, TestingModule } from '@nestjs/testing';
import { BillingPlanService } from '../billing-plan.service';
import { Repository } from 'typeorm';
import { getRepositoryToken } from '@nestjs/typeorm';
import { BillingPlan } from '../entities/billing-plan.entity';
import { NotFoundException, BadRequestException, HttpStatus } from '@nestjs/common';
import { CustomHttpException } from '../../../helpers/custom-http-filter';
import * as SYS_MSG from '../../../helpers/SystemMessages';
import { BillingPlanMapper } from '../mapper/billing-plan.mapper';

describe('BillingPlanService', () => {
  let service: BillingPlanService;
  let repository: Repository<BillingPlan>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        BillingPlanService,
        {
          provide: getRepositoryToken(BillingPlan),
          useClass: Repository,
        },
      ],
    }).compile();

    service = module.get<BillingPlanService>(BillingPlanService);
    repository = module.get<Repository<BillingPlan>>(getRepositoryToken(BillingPlan));
  });

  describe('createBillingPlan', () => {
    it('should throw an error if they already exist', async () => {
      const createPlanDto = {
        name: 'Free',
        description: 'free plan',
        amount: 0,
        frequency: 'never',
        is_active: true,
      };

      const billingPlan = {
        id: '1',
        name: 'Free',
        description: 'free plan',
        amount: 0,
        frequency: 'never',
        is_active: true,
        created_at: new Date(),
        updated_at: new Date(),
      };

      jest.spyOn(repository, 'findOne').mockResolvedValue(billingPlan as BillingPlan);

      await service
        .createBillingPlan(createPlanDto)
        .rejects.toThrow(new CustomHttpException(SYS_MSG.BILLING_PLAN_ALREADY_EXISTS, HttpStatus.BAD_REQUEST));
    });
  });

  describe('getAllBillingPlans', () => {
    it('should return all billing plans', async () => {
      const billingPlans = [
        {
          id: '1',
          name: 'Free',
          description: 'free plan',
          amount: 0,
          frequency: 'never',
          is_active: true,
          created_at: new Date(),
          updated_at: new Date(),
        },
        {
          id: '2',
          name: 'Standard',
          description: 'standard plan',
          amount: 50,
          frequency: 'monthly',
          is_active: true,
          created_at: new Date(),
          updated_at: new Date(),
        },
        {
          id: '1',
          name: 'Premium',
          description: 'premium plan',
          amount: 120,
          frequency: 'monthly',
          is_active: true,
          created_at: new Date(),
          updated_at: new Date(),
        },
      ];

      jest.spyOn(repository, 'find').mockResolvedValue(billingPlans as BillingPlan[]);

      const result = await service.getAllBillingPlans();

      expect(result).toEqual({
        message: 'Billing plans retrieved successfully',
        data: billingPlans.map(plan => BillingPlanMapper.mapToResponseFormat(plan)),
      });
    });

    it('should throw a NotFoundException if no billing plans are found', async () => {
      jest.spyOn(repository, 'find').mockResolvedValue([]);

      await expect(service.getAllBillingPlans()).rejects.toThrow(NotFoundException);
    });
  });

  describe('getSingleBillingPlan', () => {
    it('should return a single billing plan', async () => {
      const billingPlan = {
        id: '1',
        name: 'Free',
        description: 'free plan',
        amount: 0,
        frequency: 'never',
        is_active: true,
        created_at: new Date(),
        updated_at: new Date(),
      };

      jest.spyOn(repository, 'findOneBy').mockResolvedValue(billingPlan as BillingPlan);

      const result = await service.getSingleBillingPlan('1');

      expect(result).toEqual({
        message: 'Billing plan retrieved successfully',
        data: BillingPlanMapper.mapToResponseFormat(billingPlan),
      });
    });

    it('should throw a BadRequestException if planId is invalid', async () => {
      await expect(service.getSingleBillingPlan('')).rejects.toThrow(BadRequestException);
    });

    it('should throw a NotFoundException if billing plan is not found', async () => {
      jest.spyOn(repository, 'findOneBy').mockResolvedValue(null);

      await expect(service.getSingleBillingPlan('1')).rejects.toThrow(NotFoundException);
    });
  });
});
