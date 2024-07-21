import { Test, TestingModule } from '@nestjs/testing';
import { ProductsService } from '../src/products/products.service';
import { Repository } from 'typeorm';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Product } from '../src/products/entities/product.entity';
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

  it('should return search results', async () => {
    const query = 'test';
    const products = [
      {
        id: 1,
        name: 'Test Product',
        description: 'Description for Test Product',
        category: 'Test Category',
        tags: ['test', 'product'],
      },
    ];

    jest.spyOn(repository, 'createQueryBuilder').mockReturnValue({
      where: jest.fn().mockReturnThis(),
      skip: jest.fn().mockReturnThis(),
      take: jest.fn().mockReturnThis(),
      getManyAndCount: jest.fn().mockResolvedValue([products, 1]),
    } as any);

    const result = await service.searchProducts(query);

    expect(result).toEqual({ total: 1, results: products });
  });

  it('should handle pagination correctly', async () => {
    const query = 'test';
    const productsPage1 = [
      {
        id: 1,
        name: 'Test Product 1',
        description: 'Description for Test Product 1',
        category: 'Test Category',
        tags: ['test', 'product'],
      },
    ];

    jest.spyOn(repository, 'createQueryBuilder').mockReturnValue({
      where: jest.fn().mockReturnThis(),
      skip: jest.fn().mockReturnThis(),
      take: jest.fn().mockReturnThis(),
      getManyAndCount: jest.fn().mockResolvedValue([productsPage1, 1]),
    } as any);

    const result = await service.searchProducts(query, 1, 1);

    expect(result).toEqual({ total: 1, results: productsPage1 });
  });

  it('should return empty results if no products match', async () => {
    const query = 'nonexistent';
    
    jest.spyOn(repository, 'createQueryBuilder').mockReturnValue({
      where: jest.fn().mockReturnThis(),
      skip: jest.fn().mockReturnThis(),
      take: jest.fn().mockReturnThis(),
      getManyAndCount: jest.fn().mockResolvedValue([[], 0]),
    } as any);

    const result = await service.searchProducts(query);

    expect(result).toEqual({ total: 0, results: [] });
  });

  it('should handle pagination correctly', async () => {
    const query = 'test';
    const productsPage1 = [
      {
        id: 1,
        name: 'Test Product 1',
        description: 'Description for Test Product 1',
        category: 'Test Category',
        tags: ['test', 'product'],
      },
    ];

    jest.spyOn(repository, 'createQueryBuilder').mockReturnValue({
      where: jest.fn().mockReturnThis(),
      skip: jest.fn().mockReturnThis(),
      take: jest.fn().mockReturnThis(),
      getManyAndCount: jest.fn().mockResolvedValue([productsPage1, 1]),
    } as any);

    const result = await service.searchProducts(query, 1, 1);

    expect(result).toEqual({ total: 1, results: productsPage1 });
  });

  it('should return empty results if no products match', async () => {
    const query = 'nonexistent';
    
    jest.spyOn(repository, 'createQueryBuilder').mockReturnValue({
        where: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        take: jest.fn().mockReturnThis(),
        getManyAndCount: jest.fn().mockResolvedValue([[], 0]),
      } as any);
  
      const result = await service.searchProducts(query);
  
      expect(result).toEqual({ total: 0, results: [] });
    });
  
});