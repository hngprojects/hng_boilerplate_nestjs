import { Test, TestingModule } from '@nestjs/testing';
import { SubscriptionPlansService } from './subscription_plans.service';

describe('SubscriptionPlansService', () => {
  let service: SubscriptionPlansService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [SubscriptionPlansService],
    }).compile();

    service = module.get<SubscriptionPlansService>(SubscriptionPlansService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
