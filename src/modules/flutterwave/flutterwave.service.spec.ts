import { Test, TestingModule } from '@nestjs/testing';
import { FlutterwaveService } from './flutterwave.service';

describe('FlutterwaveService', () => {
  let service: FlutterwaveService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [FlutterwaveService],
    }).compile();

    service = module.get<FlutterwaveService>(FlutterwaveService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
