import { Test, TestingModule } from '@nestjs/testing';
import { BillingPlanService } from '../billing-plan.service';
import { Repository } from 'typeorm';
import { getRepositoryToken } from '@nestjs/typeorm';
import { BillingPlan } from '../entities/billing-plan.entity';
import { NotFoundException, HttpException, BadRequestException } from '@nestjs/common';
import { BillingPlanDto } from '../dto/billing-plan.dto';

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
    it('should return existing billing plans if they already exist', async () => {
      const billingPlans = [
        { id: '1', name: 'Free', price: 0 },
        { id: '2', name: 'Basic', price: 20 },
      ];

      jest.spyOn(repository, 'find').mockResolvedValue(billingPlans as BillingPlan[]);

      const result = await service.createBillingPlan();

      expect(result).toEqual({
        status_code: 200,
        message: 'Billing plans already exist in the database',
        data: billingPlans,
      });
    });
  });

  describe('getAllBillingPlans', () => {
    it('should return all billing plans', async () => {
      const billingPlans = [
        { id: '1', name: 'Free', price: 0 },
        { id: '2', name: 'Basic', price: 20 },
      ];

      jest.spyOn(repository, 'find').mockResolvedValue(billingPlans as BillingPlan[]);

      const result = await service.getAllBillingPlans();

      expect(result).toEqual({
        message: 'Billing plans retrieved successfully',
        data: billingPlans.map(plan => ({ id: plan.id, name: plan.name, price: plan.price })),
      });
    });

    it('should throw a NotFoundException if no billing plans are found', async () => {
      jest.spyOn(repository, 'find').mockResolvedValue([]);

      await expect(service.getAllBillingPlans()).rejects.toThrow(NotFoundException);
    });
  });

  describe('getSingleBillingPlan', () => {
    it('should return a single billing plan', async () => {
      const billingPlan = { id: '1', name: 'Free', price: 0 };

      jest.spyOn(repository, 'findOneBy').mockResolvedValue(billingPlan as BillingPlan);

      const result = await service.getSingleBillingPlan('1');

      expect(result).toEqual({
        message: 'Billing plan retrieved successfully',
        data: { id: billingPlan.id, name: billingPlan.name, price: billingPlan.price },
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
