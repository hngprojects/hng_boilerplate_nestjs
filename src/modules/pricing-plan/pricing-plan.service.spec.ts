import { Test, TestingModule } from '@nestjs/testing';
import { PricingPlanService } from './pricing-plan.service';

describe('PricingPlanService', () => {
  let service: PricingPlanService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [PricingPlanService],
    }).compile();

    service = module.get<PricingPlanService>(PricingPlanService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
