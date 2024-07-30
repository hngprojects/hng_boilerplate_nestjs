import { Test, TestingModule } from '@nestjs/testing';
import { ProductsService } from '../products.service';
import { Repository } from 'typeorm';
import { Product } from '../../products/entities/product.entity';
import { getRepositoryToken } from '@nestjs/typeorm';
import { productMock } from './mocks/product.mock';
import { createProductRequestDtoMock } from './mocks/product-request-dto.mock';

describe('ProductsService', () => {
  let service: ProductsService;
  let repository: Repository<Product>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProductsService,
        {
          provide: getRepositoryToken(Product),
          useValue: {
            findBy: jest.fn(),
            findOne: jest.fn(),
            create: jest.fn().mockReturnValue(productMock),
            save: jest.fn().mockReturnValue(productMock),
            findOneBy: jest.fn(),
            update: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<ProductsService>(ProductsService);
    repository = module.get<Repository<Product>>(getRepositoryToken(Product));
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create a new product', () => {
    it('should creates a new product', async () => {
      const createdProduct = await service.createProduct('orgId', createProductRequestDtoMock);

      expect(repository.create).toHaveBeenCalledWith({
        name: createProductRequestDtoMock.name,
        quantity: createProductRequestDtoMock.quantity,
        price: createProductRequestDtoMock.price,
      });

      expect(repository.save).toHaveBeenCalledWith(productMock);
      expect(createdProduct.data.name).toEqual(createProductRequestDtoMock.name);
      expect(createdProduct.message).toEqual('Product created successfully');
      expect(createdProduct.status).toEqual('success');
    });
  });
});
