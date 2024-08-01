import { Test, TestingModule } from '@nestjs/testing';
import { RunTestsService } from './run-tests.service';

describe('RunTestsService', () => {
  let service: RunTestsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [RunTestsService],
    }).compile();

    service = module.get<RunTestsService>(RunTestsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
