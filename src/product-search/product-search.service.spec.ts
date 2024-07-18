import { Test, TestingModule } from '@nestjs/testing';
import { ProductSearchService } from './product-search.service';

describe('ProductSearchService', () => {
  let service: ProductSearchService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ProductSearchService],
    }).compile();

    service = module.get<ProductSearchService>(ProductSearchService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
