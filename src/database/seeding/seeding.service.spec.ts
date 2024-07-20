import { Test, TestingModule } from '@nestjs/testing';
import { SeedingService } from './seeding.service';

describe('SeedingService', () => {
  let service: SeedingService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [SeedingService],
    }).compile();

    service = module.get<SeedingService>(SeedingService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
