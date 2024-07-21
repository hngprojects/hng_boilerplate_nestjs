import { Test, TestingModule } from '@nestjs/testing';
import { SubscriptionPlansController } from './subscription_plans.controller';
import { SubscriptionPlansService } from './subscription_plans.service';
import { CreateSubscriptionPlanDto } from './dto/create-subscription_plan.dto';
import { SubscriptionPlan } from 'src/database/entities/subscription_plan.entity';

describe('SubscriptionPlansController', () => {
  let controller: SubscriptionPlansController;
  let service: SubscriptionPlansService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [SubscriptionPlansController],
      providers: [
        {
          provide: SubscriptionPlansService,
          useValue: {
            create: jest.fn().mockResolvedValue({
              id: '1',
              name: 'Test Plan',
              description: 'Test Description',
              price: 10,
              duration: '30 days',
              features: ['Basic', 'Premium'],
              createdAt: new Date('2024-07-21T12:00:00Z'),
              updatedAt: new Date('2024-07-21T12:30:00Z'),
            }),
          },
        },
      ],
    }).compile();

    controller = module.get<SubscriptionPlansController>(SubscriptionPlansController);
    service = module.get<SubscriptionPlansService>(SubscriptionPlansService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('should create a subscription plan', async () => {
      const createSubscriptionPlanDto: CreateSubscriptionPlanDto = {
        name: 'Test Plan',
        description: 'Test Description',
        price: 10,
        duration: '30 days',
        features: ['Basic', 'Premium'],
      };
      const result: SubscriptionPlan = {
        id: '1',
        name: 'Test Plan',
        description: 'Test Description',
        price: 10,
        duration: '30 days',
        features: ['Basic', 'Premium'],
        createdAt: new Date('2024-07-21T12:00:00Z'),
        updatedAt: new Date('2024-07-21T12:30:00Z'),
      };

      jest.spyOn(service, 'create').mockResolvedValue(result);

      expect(await controller.create(createSubscriptionPlanDto)).toEqual(result);
      expect(service.create).toHaveBeenCalledWith(createSubscriptionPlanDto);
    });
  });
});
