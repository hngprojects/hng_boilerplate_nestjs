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

    it('should throw NotFoundException when product does not exist', async () => {
      mockRepository.findOne.mockResolvedValue(null);

      const result = await service.fetchSingleProduct('2');

      expect(result).toEqual({
        error: 'Product not found',
        status_code: HttpStatus.NOT_FOUND,
      });
    });

    it('should throw InternalServerErrorException on unexpected errors', async () => {
      const unexpectedError = new InternalServerErrorException();
      mockRepository.findOne.mockRejectedValue(unexpectedError);

      await expect(service.fetchSingleProduct('1')).rejects.toThrow(InternalServerErrorException);
    });
  });
});
