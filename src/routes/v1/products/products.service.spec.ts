import { Test, TestingModule } from '@nestjs/testing';
import { ProductsService } from '../../../services/products.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Product } from '../../../entities/product.entity';
import { Repository } from 'typeorm';

describe('ProductsService', () => {
  let service: ProductsService;
  let repository: Repository<Product>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProductsService,
        {
          provide: getRepositoryToken(Product),
          useClass: Repository,
        },
      ],
    }).compile();

    service = module.get<ProductsService>(ProductsService);
    repository = module.get<Repository<Product>>(getRepositoryToken(Product));
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
