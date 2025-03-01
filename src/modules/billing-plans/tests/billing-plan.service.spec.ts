import 'module-alias/register';
import 'reflect-metadata';
import { Test, TestingModule } from '@nestjs/testing';
import { BillingPlanService } from '../billing-plan.service';
import { Repository } from 'typeorm';
import { getRepositoryToken } from '@nestjs/typeorm';
import { BillingPlan } from '../entities/billing-plan.entity';
import { NotFoundException, BadRequestException, HttpStatus } from '@nestjs/common';
import { CustomHttpException } from '@shared/helpers/custom-http-filter';
import * as SYS_MSG from '@shared/constants/SystemMessages';
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

      await expect(service.createBillingPlan(createPlanDto)).rejects.toThrow(
        new CustomHttpException(SYS_MSG.BILLING_PLAN_ALREADY_EXISTS, HttpStatus.BAD_REQUEST)
      );
    });
  });

  describe('getAllBillingPlans', () => {
    it('should return paginated billing plans', async () => {
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
      ];
  
      const total = 2; // Total number of billing plans in the database
  
      // Mock findAndCount to return paginated results
      jest.spyOn(repository, 'findAndCount').mockResolvedValue([billingPlans as BillingPlan[], total]);
  
      const result = await service.getAllBillingPlans(1, 10);
  
      // Verify the response structure
      expect(result).toEqual({
        message: 'Billing plans retrieved successfully',
        data: {
          plans: billingPlans.map(plan => BillingPlanMapper.mapToResponseFormat(plan)),
          total,
        },
      });
  
      // Verify that findAndCount was called with the correct pagination parameters
      expect(repository.findAndCount).toHaveBeenCalledWith({
        skip: 0, // (page - 1) * limit = (1 - 1) * 10 = 0
        take: 10, // limit = 10
      });
    });
  
    it('should throw a NotFoundException if no billing plans are found', async () => {
      // Mock findAndCount to return an empty array
      jest.spyOn(repository, 'findAndCount').mockResolvedValue([[], 0]);
  
      await expect(service.getAllBillingPlans(1, 10)).rejects.toThrow(NotFoundException);
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
