import { Test, TestingModule } from '@nestjs/testing';
import { ProductsService } from '../src/products/products.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
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

//   const createQueryBuilderMock = () => ({
//     where: jest.fn().mockReturnThis(),
//     skip: jest.fn().mockReturnThis(),
//     take: jest.fn().mockReturnThis(),
//     getManyAndCount: jest.fn().mockResolvedValue([[], 0]),
//   });

//   it('should return search results', async () => {
//     const query = 'test';
//     const products = [
//       {
//         id: 1,
//         name: 'Test Product',
//         description: 'Description for Test Product',
//         category: 'Test Category',
//         tags: ['test', 'product'],
//       },
//     ];

//     jest.spyOn(repository, 'createQueryBuilder').mockReturnValue(createQueryBuilderMock());
//     (repository.createQueryBuilder().getManyAndCount as jest.Mock).mockResolvedValue([products, 1]);

//     const result = await service.searchProducts(query);

//     expect(result).toEqual({ total: 1, results: products });
//   });

// const createQueryBuilderMock = () => ({
//     where: jest.fn().mockReturnThis(),
//     skip: jest.fn().mockReturnThis(),
//     take: jest.fn().mockReturnThis(),
//     getManyAndCount: jest.fn().mockResolvedValue([[], 0]),
//   } as jest.Mocked<SelectQueryBuilder<Product>>);

const createQueryBuilderMock = jest.fn(() => ({
    where: jest.fn().mockReturnThis(),
    skip: jest.fn().mockReturnThis(),
    take: jest.fn().mockReturnThis(),
    getManyAndCount: jest.fn().mockResolvedValue([[], 0]),
  }));
  
  jest.spyOn(repository, 'createQueryBuilder').mockImplementation(createQueryBuilderMock);
  
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
  
    jest.spyOn(repository, 'createQueryBuilder').mockReturnValue(createQueryBuilderMock());
    (repository.createQueryBuilder().getManyAndCount as jest.Mock).mockResolvedValue([products, 1]);
  
    const result = await service.searchProducts(query);
  
    expect(result).toEqual({ total: 1, results: products });
  });

  it('should return empty results if no products match', async () => {
    const query = 'nonexistent';

    jest.spyOn(repository, 'createQueryBuilder').mockReturnValue(createQueryBuilderMock());
    (repository.createQueryBuilder().getManyAndCount as jest.Mock).mockResolvedValue([[], 0]);

    const result = await service.searchProducts(query);

    expect(result).toEqual({ total: 0, results: [] });
  });

  it('should handle pagination correctly', async () => {
    const query = 'test';
    const products = [
      {
        id: 1,
        name: 'Test Product 1',
        description: 'Description for Test Product 1',
        category: 'Test Category',
        tags: ['test', 'product'],
      },
      {
        id: 2,
        name: 'Test Product 2',
        description: 'Description for Test Product 2',
        category: 'Test Category',
        tags: ['test', 'product'],
      },
    ];

    jest.spyOn(repository, 'createQueryBuilder').mockReturnValue(createQueryBuilderMock());
    (repository.createQueryBuilder().getManyAndCount as jest.Mock).mockResolvedValue([products, 2]);

    const result = await service.searchProducts(query, 1, 10);

    expect(result).toEqual({ total: 2, results: products });
  });
});