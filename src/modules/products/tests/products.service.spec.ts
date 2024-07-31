import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ProductsService } from '../products.service';
import { Product } from '../entities/product.entity';
import { Organisation } from '../../../modules/organisations/entities/organisations.entity';
import { orgMock } from '../../../modules/organisations/tests/mocks/organisation.mock';
import { createProductRequestDtoMock } from './mocks/product-request-dto.mock';
import { productMock } from './mocks/product.mock';
import { NotFoundException } from '@nestjs/common';
import { User, UserType } from '../../../modules/user/entities/user.entity';
import { CreateCommentDto } from '../dto/create-commemt.dto';
import { ProductComment } from '../../../modules/product-comment/entities/product-comment.entity';
import { productCommentMock } from '../../../modules/product-comment/mocks/product-comment.mock';

describe('ProductsService', () => {
  let service: ProductsService;
  let productRepository: Repository<Product>;
  let organisationRepository: Repository<Organisation>;
  let userRepository: Repository<User>;
  let productCommentRepository: Repository<ProductComment>;

  const userMock: User = {
    id: 'user-mock-id',
    first_name: 'John',
    last_name: 'Doe',
    email: 'john.doe@example.com',
    password: 'hashed-password',
    phone: '1234567890',
    is_active: true,
    attempts_left: 3,
    time_left: 60,
    secret: 'secret',
    is_2fa_enabled: false,
    user_type: UserType.ADMIN,
    owned_organisations: [],
    created_organisations: [],
    invites: [],
    jobs: [],
    profile: null,
    testimonials: [],
    organisationMembers: [],
    productComments: [],
    hashPassword: jest.fn(),
    created_at: undefined,
    updated_at: undefined,
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProductsService,
        {
          provide: getRepositoryToken(Product),
          useValue: {
            findOne: jest.fn(),
            create: jest.fn(),
            save: jest.fn(),
            createQueryBuilder: jest.fn(),
          },
        },
        {
          provide: getRepositoryToken(Organisation),
          useValue: {
            findOne: jest.fn(),
          },
        },
        {
          provide: getRepositoryToken(User),
          useValue: {
            findOne: jest.fn(),
          },
        },
        {
          provide: getRepositoryToken(ProductComment),
          useValue: {
            create: jest.fn(),
            save: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<ProductsService>(ProductsService);
    productRepository = module.get<Repository<Product>>(getRepositoryToken(Product));
    organisationRepository = module.get<Repository<Organisation>>(getRepositoryToken(Organisation));
    userRepository = module.get<Repository<User>>(getRepositoryToken(User));
    productCommentRepository = module.get<Repository<ProductComment>>(getRepositoryToken(ProductComment));
  });

  it('should create a new product', async () => {
    jest.spyOn(organisationRepository, 'findOne').mockResolvedValue(orgMock);
    jest.spyOn(productRepository, 'create').mockReturnValue(createProductRequestDtoMock as any);
    jest.spyOn(productRepository, 'save').mockResolvedValue(productMock as any);

    const createdProduct = await service.createProduct(orgMock.id, createProductRequestDtoMock);

    expect(createdProduct.message).toEqual('Product created successfully');
    expect(createdProduct.status).toEqual('success');
  });

  describe('searchProducts', () => {
    it('should return products based on name search', async () => {
      const searchCriteria = { name: 'Product 1' };
      const queryBuilderMock = {
        andWhere: jest.fn().mockReturnThis(),
        getMany: jest.fn().mockResolvedValue([productMock]),
      };
      jest.spyOn(productRepository, 'createQueryBuilder').mockReturnValue(queryBuilderMock as any);

      const products = await service.searchProducts(searchCriteria);

      expect(products).toEqual({ success: true, statusCode: 200, products: [productMock] });
    });

    // it('should return products based on category search', async () => {
    //   const searchCriteria = { category: 'kids' };
    //   const queryBuilderMock = {
    //     andWhere: jest.fn().mockReturnThis(),
    //     getMany: jest.fn().mockResolvedValue([productMock]),  // Return array of products
    //   };
    //   jest.spyOn(productRepository, 'createQueryBuilder').mockReturnValue(queryBuilderMock as any);

    //   const products = await service.searchProducts(searchCriteria);

    //   expect(products).toEqual({ success: true, statusCode: 200, products: [productMock] });
    // });

    it('should return products based on price range search', async () => {
      const searchCriteria = { minPrice: 100, maxPrice: 200 };
      const queryBuilderMock = {
        andWhere: jest.fn().mockReturnThis(),
        getMany: jest.fn().mockResolvedValue([productMock]), // Return array of products
      };
      jest.spyOn(productRepository, 'createQueryBuilder').mockReturnValue(queryBuilderMock as any);

      const products = await service.searchProducts(searchCriteria);

      expect(products).toEqual({ success: true, statusCode: 200, products: [productMock] });
    });

    it('should return products based on combined search criteria', async () => {
      // const searchCriteria = { name: 'TV', category: 'kids', minPrice: 100, maxPrice: 200 };
      const searchCriteria = { name: 'Product 1', minPrice: 100, maxPrice: 200 };
      const queryBuilderMock = {
        andWhere: jest.fn().mockReturnThis(),
        getMany: jest.fn().mockResolvedValue([productMock]),
      };
      jest.spyOn(productRepository, 'createQueryBuilder').mockReturnValue(queryBuilderMock as any);

      const products = await service.searchProducts(searchCriteria);

      expect(products).toEqual({ success: true, statusCode: 200, products: [productMock] });
    });

    it('should throw NotFoundException if no products match search criteria', async () => {
      const searchCriteria = { name: 'nonexistent' };
      const queryBuilderMock = {
        andWhere: jest.fn().mockReturnThis(),
        getMany: jest.fn().mockResolvedValue([]), // Return empty array
      };
      jest.spyOn(productRepository, 'createQueryBuilder').mockReturnValue(queryBuilderMock as any);

      await expect(service.searchProducts(searchCriteria)).rejects.toThrow(
        new NotFoundException({ status: 'No Content', status_code: 204, message: 'No products found' })
      );
    });
  });

  describe('addComment', () => {
    it('should successfully add a comment', async () => {
      const createCommentDto: CreateCommentDto = {
        userId: userMock.id,
        comment: 'Great product!',
      };

      jest.spyOn(productRepository, 'findOne').mockResolvedValue(productMock);
      jest.spyOn(userRepository, 'findOne').mockResolvedValue(userMock);
      jest.spyOn(productCommentRepository, 'create').mockReturnValue(productCommentMock as any);

      const result = await service.addComment(productMock.id, createCommentDto);

      expect(result.message).toEqual('Comment added successfully');
      expect(result.status).toEqual('success');
      expect(result.status_code).toEqual(201);
      expect(result.data.comment).toEqual('Great product!');
    });

    it('should throw NotFoundException if product is not found', async () => {
      const createCommentDto: CreateCommentDto = {
        userId: userMock.id,
        comment: 'Great product!',
      };

      jest.spyOn(productRepository, 'findOne').mockResolvedValue(null);

      await expect(service.addComment(productMock.id, createCommentDto)).rejects.toThrow(
        new NotFoundException({ status: 'Not Found', message: 'Product not found' })
      );
    });

    it('should throw NotFoundException if user is not found', async () => {
      const createCommentDto: CreateCommentDto = {
        userId: userMock.id,
        comment: 'Great product!',
      };

      jest.spyOn(productRepository, 'findOne').mockResolvedValue(productMock);
      jest.spyOn(userRepository, 'findOne').mockResolvedValue(null);

      await expect(service.addComment(productMock.id, createCommentDto)).rejects.toThrow(
        new NotFoundException({ status: 'Not Found', message: 'User not found' })
      );
    });
  });
});
