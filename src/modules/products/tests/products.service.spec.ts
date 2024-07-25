import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ProductsService } from '../products.service';
import { Product } from '../entities/product.entity';
import { BadRequestException } from '@nestjs/common';
import { User } from '../../user/entities/user.entity';
import { ProductCategory } from '../../product-category/entities/product-category.entity';

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
            findAndCount: jest.fn(),
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

  describe('findAll', () => {
    it('should return paginated products', async () => {
      const mockProducts: Partial<Product>[] = [
        {
          id: '1',
          product_name: 'Product 1',
          description: 'Description 1',
          quantity: 10,
          price: 100,
          user: {} as User,
          category: {} as ProductCategory,
          created_at: new Date(),
          updated_at: new Date()
        },
        {
          id: '2',
          product_name: 'Product 2',
          description: 'Description 2',
          quantity: 20,
          price: 200,
          user: {} as User,
          category: {} as ProductCategory,
          created_at: new Date(),
          updated_at: new Date()
        }
      ];
      const mockTotalCount = 10;

      jest.spyOn(repository, 'findAndCount').mockResolvedValue([mockProducts as Product[], mockTotalCount]);

      const result = await service.findAllProducts(1, 5);

      expect(result).toEqual({
        success: true,
        message: "Product retrieved successfully",
        products: mockProducts,
        pagination: {
          totalItems: mockTotalCount,
          totalPages: 2,
          currentPage: 1
        },
        status_code: 200
      });
    });

    it('should throw BadRequestException for invalid limit', async () => {
      jest.spyOn(repository, 'findAndCount').mockResolvedValue([[], 0]);
      await expect(service.findAllProducts(1, -5)).rejects.toThrow(BadRequestException);
    });

    it('should throw BadRequestException for invalid page', async () => {
      jest.spyOn(repository, 'findAndCount').mockResolvedValue([[], 0]);
      await expect(service.findAllProducts(-1, 5)).rejects.toThrow(BadRequestException);
    });

    it('should use default values when page and limit are not provided', async () => {
      const mockProducts: Partial<Product>[] = [
        {
          id: '1',
          product_name: 'Product 1',
          description: 'Description 1',
          quantity: 10,
          price: 100,
          user: {} as User,
          category: {} as ProductCategory,
          created_at: new Date(),
          updated_at: new Date()
        }
      ];
      const mockTotalCount = 1;

      jest.spyOn(repository, 'findAndCount').mockResolvedValue([mockProducts as Product[], mockTotalCount]);

      const result = await service.findAllProducts();

      expect(result.pagination.currentPage).toBe(1);
      expect(repository.findAndCount).toHaveBeenCalledWith({
        take: 5,
        skip: 0
      });
    });
  });
});