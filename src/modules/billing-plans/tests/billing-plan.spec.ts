import { Test, TestingModule } from '@nestjs/testing';
import { BillingPlanService } from '../billing-plan.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BillingPlan } from '../entities/billing-plan.entity';
import { NotFoundException } from '@nestjs/common';

const mockBillingPlans = [
  { id: 'uid-id-number-1', name: 'Basic Plan', price: 10, created_at: new Date(), updated_at: new Date() },
  { id: 'uid-id-number-2', name: 'Premium Plan', price: 20, created_at: new Date(), updated_at: new Date() },
];

const mockBillingPlanRepository = () => ({
  find: jest.fn(),
});

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

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getAllBillingPlans', () => {
    it('should return all billing plans', async () => {
      jest.spyOn(repository, 'find').mockResolvedValueOnce(mockBillingPlans);

      const result = await service.getAllBillingPlans();

      expect(result).toEqual({
        message: 'Billing plans retrieved successfully',
        data: mockBillingPlans,
      });
    });

    it('should throw NotFoundException if no billing plans are found', async () => {
      jest.spyOn(repository, 'find').mockResolvedValueOnce([]);

      await expect(service.getAllBillingPlans()).rejects.toThrow(NotFoundException);
      await expect(service.getAllBillingPlans()).rejects.toThrow('No billing plans found');
    });
  });
});
