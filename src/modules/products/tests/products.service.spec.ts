import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ProductsService } from '../products.service';
import { Product } from '../entities/product.entity';
import { BadRequestException, HttpStatus, InternalServerErrorException, NotFoundException} from '@nestjs/common';
import { productMock } from './mocks/product.mock';
import { Organisation } from '../../../modules/organisations/entities/organisations.entity';
import { orgMock } from '../../../modules/organisations/tests/mocks/organisation.mock';
import { createProductRequestDtoMock } from './mocks/product-request-dto.mock';

describe('ProductsService', () => {
  let service: ProductsService;
  let productRepository: Repository<Product>;
  let organisationRepository: Repository<Organisation>;

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
          useClass: Repository,
        },
        {
          provide: getRepositoryToken(Organisation),
          useValue: {
            findOne: jest.fn(),
            create: jest.fn().mockReturnValue(productMock),
            save: jest.fn().mockReturnValue(productMock),
            
          },
          useClass: Repository,
        },
      ],
    }).compile();

    service = module.get<ProductsService>(ProductsService);
    productRepository = module.get<Repository<Product>>(getRepositoryToken(Product));
    organisationRepository = module.get<Repository<Organisation>>(getRepositoryToken(Organisation));
  });


  describe('fetchAllProduct', () => {
    it('should return products with pagination', async () => {
      const mockProducts = [productMock];
      const mockTotalCount = 10;

      jest.spyOn(productRepository, 'findAndCount').mockResolvedValue([mockProducts, mockTotalCount]);

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
    it('should return empty array when no products found', async () => {
      jest.spyOn(productRepository, 'findAndCount').mockResolvedValue([[], 0]);
    
      const result = await service.findAllProducts();
    
      expect(result.products).toEqual([]);
      expect(result.pagination.totalItems).toBe(0);
    });

    it('should throw BadRequestException for invalid limit', async () => {
      jest.spyOn(productRepository, 'findAndCount').mockResolvedValue([[], 0]);
      await expect(service.findAllProducts(1, -5)).rejects.toThrow(BadRequestException);
    });

    it('should throw BadRequestException for invalid page', async () => {
      jest.spyOn(productRepository, 'findAndCount').mockResolvedValue([[], 0]);
      await expect(service.findAllProducts(-1, 5)).rejects.toThrow(BadRequestException);
    });

    it('should use default values when page and limit are not provided', async () => {
      const mockProducts = [productMock];
      const mockTotalCount = 1;

      jest.spyOn(productRepository, 'findAndCount').mockResolvedValue([mockProducts as Product[], mockTotalCount]);

      const result = await service.findAllProducts();

      expect(result.pagination.currentPage).toBe(1);
      expect(productRepository.findAndCount).toHaveBeenCalledWith({
        take: 5,
        skip: 0
      });
    });
  });

  it('should create a new product', async () => {
    jest.spyOn(organisationRepository, 'findOne').mockResolvedValue(orgMock);
    jest.spyOn(productRepository, 'create').mockReturnValue(createProductRequestDtoMock as any);
    jest.spyOn(productRepository, 'save').mockResolvedValue(productMock as any);

    const createdProduct = await service.createProduct(orgMock.id, createProductRequestDtoMock);
    expect(createdProduct.message).toEqual('Product created successfully');
    expect(createdProduct.status).toEqual('success');

  })
  
  describe('fetchSingleProduct', () => {
  it('should return a product if it exists', async () => {
      jest.spyOn(productRepository, 'findOne').mockResolvedValue(productMock);

      const result = await service.fetchSingleProduct('6');

      expect(result).toEqual({
        status_code: HttpStatus.OK,
        message: 'Product fetched successfully',
        data: {
          products: {
            id: productMock.id,
            name: productMock.name,
            description: productMock.description,
            avail_qty: productMock.quantity,
            price: productMock.price,
            created_at: productMock.created_at,
            updated_at: productMock.updated_at,
          },
        },
      })
    })
  
})

})






