import { Test, TestingModule } from '@nestjs/testing';
import { ProductsService } from '../products.service';
import { Repository } from 'typeorm';
import { Product } from '../../products/entities/product.entity';
import { getRepositoryToken } from '@nestjs/typeorm';
import { HttpStatus, InternalServerErrorException, NotFoundException } from '@nestjs/common';

describe('ProductsService', () => {
  let service: ProductsService;
  let repository: Repository<Product>;

  const mockProduct = {
    id: '6',
    created_at: new Date('2024-07-24T14:22:35.443Z'),
    updated_at: new Date('2024-07-24T14:22:35.443Z'),
    product_name: 'Product 2',
    description: 'Description for Product 2',
    quantity: 20,
    price: 200,
    category: { id: '9' },
  };

  const mockRepository = {
    findOne: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProductsService,
        {
          provide: getRepositoryToken(Product),
          useValue: mockRepository,
        },
      ],
    }).compile();

    service = module.get<ProductsService>(ProductsService);
    repository = module.get<Repository<Product>>(getRepositoryToken(Product));
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('fetchSingleProduct', () => {
    it('should return a product if it exists', async () => {
      mockRepository.findOne.mockResolvedValue(mockProduct);

      const result = await service.fetchSingleProduct('6');

      expect(result).toEqual({
        status_code: HttpStatus.OK,
        message: 'Product fetched successfully',
        data: {
          products: {
            id: mockProduct.id,
            product_name: mockProduct.product_name,
            description: mockProduct.description,
            quantity: mockProduct.quantity,
            price: mockProduct.price,
            category: mockProduct.category.id,
            created_at: mockProduct.created_at,
            updated_at: mockProduct.updated_at,
          },
        },
      });
    });

    it('should throw NotFoundException if product does not exist', async () => {
      const productId = '2';
      mockRepository.findOne.mockResolvedValue(undefined);

      await expect(service.fetchSingleProduct(productId)).rejects.toThrowError(NotFoundException);
      await expect(service.fetchSingleProduct(productId)).rejects.toThrowError(
        new NotFoundException({
          error: 'Product not found',
          status_code: 404,
        })
      );
    });

    it('should throw InternalServerErrorException on unexpected errors', async () => {
      const unexpectedError = new InternalServerErrorException();
      mockRepository.findOne.mockRejectedValue(unexpectedError);

      await expect(service.fetchSingleProduct('1')).rejects.toThrow(InternalServerErrorException);
    });
  });
});

describe('ProductsService', () => {
  let service: ProductsService;
  let productRepository: Repository<Product>;

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
    productRepository = module.get<Repository<Product>>(getRepositoryToken(Product));
  });

  describe('Delete Product', () => {
    it('should delete a product successfully', async () => {
      const productId = 'some-product-id';
      jest.spyOn(productRepository, 'delete').mockResolvedValue({ affected: 1 } as any);

      const result = await service.removeProduct(productId);

      expect(result).toEqual({
        message: 'Product deleted successfully.',
        status_code: 200,
      });
      expect(productRepository.delete).toHaveBeenCalledWith(productId);
    });

    it('should throw NotFoundException if the product does not exist', async () => {
      const productId = 'non-existing-product-id';
      jest.spyOn(productRepository, 'delete').mockResolvedValue({ affected: 0 } as any);

      await expect(service.removeProduct(productId)).rejects.toThrow(NotFoundException);
      expect(productRepository.delete).toHaveBeenCalledWith(productId);
    });
  });
});
