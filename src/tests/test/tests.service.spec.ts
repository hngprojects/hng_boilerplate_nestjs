import { Test, TestingModule } from '@nestjs/testing';
import { TestsService } from './tests.service';

describe('TestsService', () => {
  let service: TestsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [TestsService],
    }).compile();

    service = module.get<TestsService>(TestsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
