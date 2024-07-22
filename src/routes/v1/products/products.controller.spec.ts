import { Test, TestingModule } from '@nestjs/testing';
import { ProductsController } from '../../../controllers/v1/products.controller';
import { ProductsService } from '../../../services/products.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Product } from '../../../entities/product.entity';
import { Repository } from 'typeorm';

describe('ProductsController', () => {
  let controller: ProductsController;
  let service: ProductsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ProductsController],
      providers: [
        ProductsService,
        {
          provide: getRepositoryToken(Product),
          useClass: Repository,
        },
      ],
    }).compile();

    controller = module.get<ProductsController>(ProductsController);
    service = module.get<ProductsService>(ProductsService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
