import { Test, TestingModule } from '@nestjs/testing';
import { ProductSearchService } from './product-search.service';
import { Repository } from 'typeorm';
import { Product } from './product.entity';
import { getRepositoryToken } from '@nestjs/typeorm';

describe('ProductSearchService', () => {
  let service: ProductSearchService;
  let repository: Repository<Product>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProductSearchService,
        {
          provide: getRepositoryToken(Product),
          useClass: Repository,
        },
      ],
    }).compile();

    service = module.get<ProductSearchService>(ProductSearchService);
    repository = module.get<Repository<Product>>(getRepositoryToken(Product));
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should search products by name', async () => {
    const productName = 'Test Product';
    const mockProducts = [{ id: 1, name: productName, category: 'Test Category', price: 100 }];
    jest.spyOn(repository, 'createQueryBuilder').mockReturnValue({
      andWhere: jest.fn().mockReturnThis(),
      getMany: jest.fn().mockResolvedValue(mockProducts),
    } as any);

    const result = await service.searchProducts(productName);

    expect(result).toEqual(mockProducts);
    expect(repository.createQueryBuilder).toHaveBeenCalledWith('product');
  });

  it('should search products by category', async () => {
    const productCategory = 'Test Category';
    const mockProducts = [{ id: 1, name: 'Test name', category: 'Test Category', price: 100 }];
    jest.spyOn(repository, 'createQueryBuilder').mockReturnValue({
      andWhere: jest.fn().mockReturnThis(),
      getMany: jest.fn().mockResolvedValue(mockProducts),
    } as any);

    const result = await service.searchProducts(undefined, productCategory);

    expect(result).toEqual(mockProducts);
    expect(repository.createQueryBuilder).toHaveBeenCalledWith('product');
  });
  it('should search products by price range', async () => {
    const minPrice = 50;
    const maxPrice = 150;
    const mockProducts = [
      { id: 1, name: 'Product 1', category: 'Category 1', price: 100 },
      { id: 2, name: 'Product 2', category: 'Category 1', price: 120 },
    ];

    jest.spyOn(repository, 'createQueryBuilder').mockReturnValue({
      andWhere: jest.fn().mockReturnThis(),
      getMany: jest.fn().mockResolvedValue(mockProducts),
    } as any);

    const result = await service.searchProducts(undefined, undefined, minPrice, maxPrice);

    expect(result).toEqual(mockProducts);
    expect(repository.createQueryBuilder).toHaveBeenCalledWith('product');
  });

  it('should search products by name and category', async () => {
    const productName = 'Test Product';
    const productCategory = 'Test Category';
    const mockProducts = [{ id: 1, name: productName, category: productCategory, price: 100 }];

    jest.spyOn(repository, 'createQueryBuilder').mockReturnValue({
      andWhere: jest.fn().mockReturnThis(),
      getMany: jest.fn().mockResolvedValue(mockProducts),
    } as any);

    const result = await service.searchProducts(productName, productCategory);

    expect(result).toEqual(mockProducts);
    expect(repository.createQueryBuilder).toHaveBeenCalledWith('product');
  });

  it('should search products by name, category, and price range', async () => {
    const productName = 'Test Product';
    const productCategory = 'Test Category';
    const minPrice = 50;
    const maxPrice = 150;
    const mockProducts = [{ id: 1, name: productName, category: productCategory, price: 100 }];

    jest.spyOn(repository, 'createQueryBuilder').mockReturnValue({
      andWhere: jest.fn().mockReturnThis(),
      getMany: jest.fn().mockResolvedValue(mockProducts),
    } as any);

    const result = await service.searchProducts(productName, productCategory, minPrice, maxPrice);

    expect(result).toEqual(mockProducts);
    expect(repository.createQueryBuilder).toHaveBeenCalledWith('product');
  });

  it('should return an empty array if no products match the criteria', async () => {
    jest.spyOn(repository, 'createQueryBuilder').mockReturnValue({
      andWhere: jest.fn().mockReturnThis(),
      getMany: jest.fn().mockResolvedValue([]),
    } as any);

    const result = await service.searchProducts('Unknown Product');

    expect(result).toEqual([]);
    expect(repository.createQueryBuilder).toHaveBeenCalledWith('product');
  });
});
