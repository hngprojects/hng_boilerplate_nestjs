import { Test, TestingModule } from '@nestjs/testing';
import { ProductsService } from '../products.service';
import { Repository } from 'typeorm';
import { Product } from '../entities/product.entity';
import { getRepositoryToken } from '@nestjs/typeorm';
import { ProductCategory } from 'src/modules/product-category/entities/product-category.entity';
import { User } from 'src/modules/user/entities/user.entity';
// import { PaginationQueryDto } from '../dto/ PaginationQueryDto';


// const mockProductRepository = () => ({
//   find: jest.fn(),
// });

// describe('ProductsService', () => {
//   let service: ProductsService;
//   let repository: Repository<Product>;

//   beforeEach(async () => {
//     const module: TestingModule = await Test.createTestingModule({
//       providers: [
//         ProductsService,
//         {
//           provide: getRepositoryToken(Product),
//           useFactory: mockProductRepository,
//         },
      
//       ],

//     }).compile();

//     service = module.get<ProductsService>(ProductsService);
//     repository = module.get<Repository<Product>>(getRepositoryToken(Product));
//   });

//   it('should be defined', () => {
//     expect(service).toBeDefined();
//   });
//   it('should return paginated products', async () => {
//     const result = [new Product(), new Product()];
//     repository.find = jest.fn().mockResolvedValue(result);

//     const paginationQuery: PaginationQueryDto = { limit: 10, page: 1 };
//     expect(await service.findAll(paginationQuery)).toEqual(result);
//     expect(repository.find).toHaveBeenCalledWith({ skip: 0, take: 10 });
//   });
// });


// import { Test, TestingModule } from '@nestjs/testing';
// import { getRepositoryToken } from '@nestjs/typeorm';
// import { ProductService } from '../products.service';
// import { Product } from './product.entity';
// import { Repository } from 'typeorm';

// describe('ProductService', () => {
//   let productService: ProductsService;
//   let productRepository: Repository<Product>;

//   beforeEach(async () => {
//     const module: TestingModule = await Test.createTestingModule({
//       providers: [
//         ProductsService,
//         {
//           provide: getRepositoryToken(Product),
//           useClass: Repository,
//         },
//       ],
//     }).compile();

//     productService = module.get<ProductsService>(ProductsService);
//     productRepository = module.get<Repository<Product>>(getRepositoryToken(Product));
//   });

//   describe('findAll', () => {
//     it('should return products with pagination when products exist', async () => {
//       const mockProducts = [
//         { id: 1, name: 'Product 1' },
//         { id: 2, name: 'Product 2' },
//       ];
//       const paginationQuery = { limit: 10, page: 1 };

//       jest.spyOn(productRepository, 'find').mockResolvedValue(mockProducts);

//       const result = await productService.findAll(paginationQuery);

//       expect(result).toEqual({
//         success: true,
//         message: 'Product retrieved successfully',
//         products: mockProducts,
//         pagination: {
//           totalItems: 2,
//           totalPages: 0.2,
//           currentPage: 1,
//         },
//         status_code: 200,
//       });
//       expect(productRepository.find).toHaveBeenCalledWith({
//         skip: 0,
//         take: 10,
//       });
//     });

//     it('should return a message when no products are available', async () => {
//       const paginationQuery = { limit: 10, page: 1 };

//       jest.spyOn(productRepository, 'find').mockResolvedValue([]);

//       const result = await productService.findAll(paginationQuery);

//       expect(result).toEqual({
//         message: 'No Product available',
//       });
//       expect(productRepository.find).toHaveBeenCalledWith({
//         skip: 0,
//         take: 10,
//       });
//     });
//   });
// });


// describe('ProductService', () => {
//   let productService: ProductsService;
//   let productRepository: Repository<Product>;

//   beforeEach(async () => {
//     const module: TestingModule = await Test.createTestingModule({
//       providers: [
//         ProductsService,
//         {
//           provide: getRepositoryToken(Product),
//           useClass: Repository,
//         },
//       ],
//     }).compile();

//     productService = module.get<ProductsService>(ProductsService);
//     productRepository = module.get<Repository<Product>>(getRepositoryToken(Product));
//   });

//   describe('findAll', () => {
//     it('should return products with pagination when products exist', async () => {
//       const mockUser: Partial<User> = { id: 1, username: 'testuser' };
//       const mockCategory: Partial<ProductCategory> = { id: 1, name: 'Electronics' };

//       const mockProducts: Partial<Product>[] = [
//         {
//           id: 1,
//           product_name: 'Smartphone X',
//           description: 'Latest model smartphone with advanced features',
//           quantity: 100,
//           price: 699,
//           user: mockUser as User,
//           category: mockCategory as ProductCategory,
//         },
//         {
//           id: 2,
//           product_name: 'Laptop Pro',
//           description: 'High-performance laptop for professionals',
//           quantity: 50,
//           price: 1299,
//           user: mockUser as User,
//           category: mockCategory as ProductCategory,
//         },
//       ];

//       const paginationQuery = { limit: 10, page: 1 };

//       jest.spyOn(productRepository, 'find').mockResolvedValue(mockProducts as Product[]);

//       const result = await productService.findAll(paginationQuery);

//       expect(result).toEqual({
//         success: true,
//         message: 'Product retrieved successfully',
//         products: mockProducts,
//         pagination: {
//           totalItems: 2,
//           totalPages: 0.2,
//           currentPage: 1,
//         },
//         status_code: 200,
//       });
//       expect(productRepository.find).toHaveBeenCalledWith({
//         skip: 0,
//         take: 10,
//       });
//     });

//     it('should return a message when no products are available', async () => {
//       const paginationQuery = { limit: 10, page: 1 };

//       jest.spyOn(productRepository, 'find').mockResolvedValue([]);

//       const result = await productService.findAll(paginationQuery);

//       expect(result).toEqual({
//         message: 'No Product available',
//       });
//       expect(productRepository.find).toHaveBeenCalledWith({
//         skip: 0,
//         take: 10,
//       });
//     });
//   });
// });

describe('ProductService', () => {
  let productService: ProductsService;
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

    productService = module.get<ProductsService>(ProductsService);
    productRepository = module.get<Repository<Product>>(getRepositoryToken(Product));
  });

  describe('findAll', () => {
    it('should return products with pagination when products exist', async () => {
      const mockUser: Partial<User> = { id: 'user1', first_name: 'testuser' };
      const mockCategory: Partial<ProductCategory> = { id: 'cat1', name: 'Electronics' };

      const mockProducts: Partial<Product>[] = [
        {
          id: 'prod1',
          product_name: 'Smartphone X',
          description: 'Latest model smartphone with advanced features',
          quantity: 100,
          price: 699,
          user: mockUser as User,
          category: mockCategory as ProductCategory,
        },
        {
          id: 'prod2',
          product_name: 'Laptop Pro',
          description: 'High-performance laptop for professionals',
          quantity: 50,
          price: 1299,
          user: mockUser as User,
          category: mockCategory as ProductCategory,
        },
      ];

      const paginationQuery = { limit: 10, page: 1 };

      jest.spyOn(productRepository, 'find').mockResolvedValue(mockProducts as Product[]);

      const result = await productService.findAll(paginationQuery);

      expect(result).toEqual({
        success: true,
        message: 'Product retrieved successfully',
        products: mockProducts,
        pagination: {
          totalItems: 2,
          totalPages: 0.2,
          currentPage: 1,
        },
        status_code: 200,
      });
      expect(productRepository.find).toHaveBeenCalledWith({
        skip: 0,
        take: 10,
      });
    });

    it('should return a message when no products are available', async () => {
      const paginationQuery = { limit: 10, page: 1 };

      jest.spyOn(productRepository, 'find').mockResolvedValue([]);

      const result = await productService.findAll(paginationQuery);

      expect(result).toEqual({
        message: 'No Product available',
      });
      expect(productRepository.find).toHaveBeenCalledWith({
        skip: 0,
        take: 10,
      });
    });
  });
});


