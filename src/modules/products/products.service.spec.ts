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
    category: 'Test Category',
    available: true,
    created_at: new Date(),
    updated_at: new Date(),
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
          category: mockProduct.category,
          available: mockProduct.available,
          created_at: mockProduct.created_at.toISOString(),
          updated_at: mockProduct.updated_at.toISOString(),
        },
      });
    });

    it('should throw NotFoundException when product does not exist', async () => {
      mockRepository.findOneBy.mockResolvedValue(null);

      await expect(service.fetchSingleProduct('1')).rejects.toThrow(NotFoundException);
    });

    it('should throw InternalServerErrorException on unexpected errors', async () => {
      mockRepository.findOneBy.mockRejectedValue(new Error('Unexpected error'));

      await expect(service.fetchSingleProduct('1')).rejects.toThrow(InternalServerErrorException);
    });
  });
});
