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
    status_code: 201,
    message: 'Product fetched successfully',
    data: {
      id: '6',
      created_at: new Date('2024-07-24T14:22:35.443Z'),
      updated_at: new Date('2024-07-24T14:22:35.443Z'),
      product_name: 'Product 2',
      description: 'Description for Product 2',
      quantity: 20,
      price: 200,
    },
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

      const result = await service.fetchSingleProduct('6');

      expect(result).toEqual({
        status_code: HttpStatus.OK,
        message: 'Product fetched successfully',
        data: mockProduct,
      });
    });

    it('should throw NotFoundException when product does not exist', async () => {
      mockRepository.findOneBy.mockResolvedValue(null);

      const result = await service.fetchSingleProduct('2');

      expect(result).toEqual({
        error: 'Product not found',
        status_code: HttpStatus.NOT_FOUND,
      });
    });

    it('should throw InternalServerErrorException on unexpected errors', async () => {
      const unexpectedError = new Error('Unexpected error occurred while fetching product');
      mockRepository.findOneBy.mockRejectedValue(unexpectedError);

      await expect(service.fetchSingleProduct('1')).rejects.toThrow(InternalServerErrorException);
    });
  });
});
