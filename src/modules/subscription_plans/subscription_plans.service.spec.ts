import { Test, TestingModule } from '@nestjs/testing';
import { SubscriptionPlansService } from './subscription_plans.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { SubscriptionPlan } from '../../database/entities/subscription_plan.entity';
import { Feature } from 'src/database/entities/feature.entity';
import { Repository } from 'typeorm';
import { ConflictException, HttpStatus } from '@nestjs/common';
import { CreateSubscriptionPlanDto } from './dto/create-subscription_plan.dto';

const mockSubscriptionPlanRepository = () => ({
  findOne: jest.fn(),
  create: jest.fn(),
  save: jest.fn(),
});

const mockFeatureRepository = () => ({
  findOne: jest.fn(),
  create: jest.fn(),
  save: jest.fn(),
});

describe('SubscriptionPlansService', () => {
  let service: SubscriptionPlansService;
  let subscriptionPlanRepository;
  let featureRepository;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SubscriptionPlansService,
        {
          provide: getRepositoryToken(SubscriptionPlan),
          useFactory: mockSubscriptionPlanRepository,
        },
        {
          provide: getRepositoryToken(Feature),
          useFactory: mockFeatureRepository,
        },
      ],
    }).compile();

    service = module.get<SubscriptionPlansService>(SubscriptionPlansService);
    subscriptionPlanRepository = module.get<Repository<SubscriptionPlan>>(getRepositoryToken(SubscriptionPlan));
    featureRepository = module.get<Repository<Feature>>(getRepositoryToken(Feature));
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a new subscription plan', async () => {
      const createSubscriptionPlanDto: CreateSubscriptionPlanDto = {
        name: 'Pro Plan',
        description: 'Pro Plan Description',
        price: 100,
        duration: 'monthly',
        feature: ['Feature1', 'Feature2'],
      };

      subscriptionPlanRepository.findOne.mockResolvedValue(null);
      featureRepository.findOne.mockImplementation(async ({ where: { feature } }) => {
        if (feature === 'Feature1') return { id: 1, feature: 'Feature1' };
        return null;
      });
      featureRepository.create.mockImplementation(feature => feature);
      featureRepository.save.mockImplementation(feature => Promise.resolve(feature));
      subscriptionPlanRepository.create.mockImplementation(plan => plan);
      subscriptionPlanRepository.save.mockImplementation(plan => Promise.resolve({ ...plan, id: 1 }));

      const result = await service.create(createSubscriptionPlanDto);

      expect(result).toEqual({
        data: {
          id: 1,
          name: 'Pro Plan',
          description: 'Pro Plan Description',
          price: 100,
          duration: 'monthly',
          features: ['Feature1', 'Feature2'],
        },
        status: HttpStatus.CREATED,
      });
    });

    it('should throw ConflictException if the subscription plan already exists', async () => {
      const createSubscriptionPlanDto: CreateSubscriptionPlanDto = {
        name: 'Pro Plan',
        description: 'Pro Plan Description',
        price: 100,
        duration: 'monthly',
        feature: ['Feature1', 'Feature2'],
      };

      subscriptionPlanRepository.findOne.mockResolvedValue({ id: 1, name: 'Pro Plan' });

      await expect(service.create(createSubscriptionPlanDto)).rejects.toThrow(ConflictException);
    });

    it('should create new features if they do not exist', async () => {
      const createSubscriptionPlanDto: CreateSubscriptionPlanDto = {
        name: 'Pro Plan',
        description: 'Pro Plan Description',
        price: 100,
        duration: 'monthly',
        feature: ['Feature1', 'Feature2'],
      };

      subscriptionPlanRepository.findOne.mockResolvedValue(null);
      featureRepository.findOne.mockResolvedValue(null);
      featureRepository.create.mockImplementation(feature => feature);
      featureRepository.save.mockImplementation(feature => Promise.resolve(feature));
      subscriptionPlanRepository.create.mockImplementation(plan => plan);
      subscriptionPlanRepository.save.mockImplementation(plan => Promise.resolve({ ...plan, id: 1 }));

      const result = await service.create(createSubscriptionPlanDto);

      expect(featureRepository.create).toHaveBeenCalledTimes(2);
      expect(featureRepository.save).toHaveBeenCalledTimes(2);
      expect(result).toEqual({
        data: {
          id: 1,
          name: 'Pro Plan',
          description: 'Pro Plan Description',
          price: 100,
          duration: 'monthly',
          features: ['Feature1', 'Feature2'],
        },
        status: HttpStatus.CREATED,
      });
    });
  });
});
