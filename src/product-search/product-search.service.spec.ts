import { Test, TestingModule } from '@nestjs/testing';
import { ProductSearchService } from './product-search.service';
import { Repository } from 'typeorm';
import { Product } from '../entities/product.entity';
import { getRepositoryToken } from '@nestjs/typeorm';
import { User } from '../entities/user.entity';

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
    const mockProducts = [
      { id: 'uid', product_name: productName, description: 'Test description', product_price: 100, user: new User() },
    ];

    jest.spyOn(repository, 'createQueryBuilder').mockReturnValue({
      andWhere: jest.fn().mockReturnThis(),
      getMany: jest.fn().mockResolvedValue(mockProducts),
    } as any);

    const result = await service.searchProducts(productName);

    expect(result).toEqual(mockProducts);
    expect(repository.createQueryBuilder).toHaveBeenCalledWith('product');
  });

  it('should search products by description', async () => {
    const productdescription = 'Test description';
    const mockProducts = [
      { id: 'uid', product_name: 'Test name', description: productdescription, product_price: 100, user: new User() },
    ];
    jest.spyOn(repository, 'createQueryBuilder').mockReturnValue({
      andWhere: jest.fn().mockReturnThis(),
      getMany: jest.fn().mockResolvedValue(mockProducts),
    } as any);

    const result = await service.searchProducts(undefined, productdescription);

    expect(result).toEqual(mockProducts);
    expect(repository.createQueryBuilder).toHaveBeenCalledWith('product');
  });
  it('should search products by price range', async () => {
    const minPrice = 50;
    const maxPrice = 150;
    const mockProducts = [
      { id: 'uid1', product_name: 'Product 1', description: 'description 1', product_price: 100, user: new User() },
      { id: 'uid2', product_name: 'Product 2', description: 'description 2', product_price: 120, user: new User() },
    ];

    jest.spyOn(repository, 'createQueryBuilder').mockReturnValue({
      andWhere: jest.fn().mockReturnThis(),
      getMany: jest.fn().mockResolvedValue(mockProducts),
    } as any);

    const result = await service.searchProducts(undefined, undefined, minPrice, maxPrice);

    expect(result).toEqual(mockProducts);
    expect(repository.createQueryBuilder).toHaveBeenCalledWith('product');
  });

  it('should search products by name and description', async () => {
    const productName = 'Test Product';
    const productdescription = 'Test description';
    const mockProducts = [
      { id: 'uid', product_name: productName, description: productdescription, product_price: 100, user: new User() },
    ];

    jest.spyOn(repository, 'createQueryBuilder').mockReturnValue({
      andWhere: jest.fn().mockReturnThis(),
      getMany: jest.fn().mockResolvedValue(mockProducts),
    } as any);

    const result = await service.searchProducts(productName, productdescription);

    expect(result).toEqual(mockProducts);
    expect(repository.createQueryBuilder).toHaveBeenCalledWith('product');
  });

  it('should search products by name, description, and price range', async () => {
    const productName = 'Test Product';
    const productdescription = 'Test description';
    const minPrice = 50;
    const maxPrice = 150;
    const mockProducts = [
      { id: 'uid', product_name: productName, description: productdescription, product_price: 100, user: new User() },
    ];

    jest.spyOn(repository, 'createQueryBuilder').mockReturnValue({
      andWhere: jest.fn().mockReturnThis(),
      getMany: jest.fn().mockResolvedValue(mockProducts),
    } as any);

    const result = await service.searchProducts(productName, productdescription, minPrice, maxPrice);

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
