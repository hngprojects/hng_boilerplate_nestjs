import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ProductsService } from '../products.service';
import { Product } from '../entities/product.entity';
import { BadRequestException, HttpStatus, InternalServerErrorException, NotFoundException} from '@nestjs/common';
import { User } from '../../user/entities/user.entity';
import { ProductCategory } from '../../product-category/entities/product-category.entity';
import { productMock } from './mocks/product.mock';
import { createProductRequestDtoMock } from './mocks/product-request-dto.mock';

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
            findBy: jest.fn(),
            findOne: jest.fn(),
            create: jest.fn().mockReturnValue(productMock),
            save: jest.fn().mockReturnValue(productMock),
            findOneBy: jest.fn(),
            update: jest.fn(),
            findAndCount: jest.fn()
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
          name: 'Product 1',
          description: 'Description 1',
          price: 100,
          user: {} as User,
          avail_qty:2,
          category: {} as ProductCategory,
          created_at: new Date("2024-07-24T14:22:35.443Z"),
          updated_at: new Date("2024-07-24T14:22:35.443Z")
        },
        {
          id: '2',
          name: 'Product 2',
          description: 'Description 2',
          avail_qty:2,
          price: 200,
          user: {} as User,
          category: {} as ProductCategory,
          created_at: new Date("2024-07-24T14:22:35.443Z"),
          updated_at: new Date("2024-07-24T14:22:35.443Z")
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
          name: 'Product 1',
          description: 'Description 1',
          avail_qty:2,
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
  describe('fetchSingleProduct', () => {

    const mockProduct = {
      id: '6',
      created_at: new Date('2024-07-24T14:22:35.443Z'),
      updated_at: new Date('2024-07-24T14:22:35.443Z'),
      name: 'Product 2',
      description: 'Description for Product 2',
      avail_qty: 20,
      price: 200,
      category: { id: '9' },
    };
  
    it('should return a product if it exists', async () => {
      mockRepository.findOne.mockResolvedValue(mockProduct);

      const result = await service.fetchSingleProduct('6');

      expect(result).toEqual({
        status_code: HttpStatus.OK,
        message: 'Product fetched successfully',
        data: {
          products: {
            id: mockProduct.id,
            name: mockProduct.name,
            description: mockProduct.description,
            avail_qty: mockProduct.avail_qty,
            price: mockProduct.price,
            category: mockProduct.category.id,
            created_at: mockProduct.created_at,
            updated_at: mockProduct.updated_at,
          },
        },
  describe('create a new product', () => {
    it('should creates a new product', async () => {
      const createdProduct = await service.createProduct('orgId', createProductRequestDtoMock);

      expect(repository.create).toHaveBeenCalledWith({
        name: createProductRequestDtoMock.name,
        quantity: createProductRequestDtoMock.quantity,
        price: createProductRequestDtoMock.price,
      });

      expect(repository.save).toHaveBeenCalledWith(productMock);
      expect(createdProduct.data.name).toEqual(createProductRequestDtoMock.name);
      expect(createdProduct.message).toEqual('Product created successfully');
      expect(createdProduct.status).toEqual('success');
    });
  });
});
