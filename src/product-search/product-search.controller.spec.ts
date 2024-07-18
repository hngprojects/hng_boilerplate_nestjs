import { Test, TestingModule } from '@nestjs/testing';
import { ProductSearchController } from './product-search.controller';

describe('ProductSearchController', () => {
  let controller: ProductSearchController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ProductSearchController],
    }).compile();

    controller = module.get<ProductSearchController>(ProductSearchController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
