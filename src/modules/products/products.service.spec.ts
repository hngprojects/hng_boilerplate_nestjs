import { Test, TestingModule } from '@nestjs/testing';
import { ProductsService } from './products.service';
import { Repository } from 'typeorm';
import { Product } from '../../entities/product.entity';
import { getRepositoryToken } from '@nestjs/typeorm';
import { InternalServerErrorException, NotFoundException } from '@nestjs/common';

describe('ProductsService', () => {
  let service: ProductsService;
  let repository: Repository<Product>;

  const mockProduct = {
    id: '1',
    product_name: 'Test Product',
    description: 'Test Description',
    product_price: 100,
  };

  const mockRepository = {
    findOneBy: jest.fn(),
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
      mockRepository.findOneBy.mockResolvedValue(mockProduct);

      const result = await service.fetchSingleProduct('1');

      expect(result).toEqual({
        status: 'success',
        message: 'Product fetched successfully',
        data: {
          id: mockProduct.id,
          name: mockProduct.product_name,
          description: mockProduct.description,
          price: mockProduct.product_price,
        },
      });
    });

    it('should throw NotFoundException when product does not exist', async () => {
      mockRepository.findOneBy.mockResolvedValue(null);

      await expect(service.fetchSingleProduct('')).rejects.toThrow(NotFoundException);
    });

    it('should throw InternalServerErrorException on unexpected errors', async () => {
      const unexpectedError = new Error('Unexpected error occurred while fetching product');
      mockRepository.findOneBy.mockRejectedValue(unexpectedError);

      await expect(service.fetchSingleProduct('1')).rejects.toThrow(InternalServerErrorException);
    });
  });
});
