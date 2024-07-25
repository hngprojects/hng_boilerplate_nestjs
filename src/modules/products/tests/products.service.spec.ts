import { Test, TestingModule } from '@nestjs/testing';
import { ProductsService } from '../products.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Product } from '../entities/product.entity';
import { ProductCategory } from '../../product-category/entities/product-category.entity';
import { CreateProductDto } from '../dto/create-product.dto';
import { NotFoundException } from '@nestjs/common';

describe('ProductsService', () => {
  let service: ProductsService;
  let productRepository: Repository<Product>;
  let categoryRepository: Repository<ProductCategory>;

  const mockProductRepository = {
    create: jest.fn().mockImplementation(dto => dto),
    save: jest.fn().mockImplementation(product => Promise.resolve({ ...product, id: '1' })),
  };

  const mockCategoryRepository = {
    findOneBy: jest.fn().mockImplementation(({ id }) => {
      if (id === '1') {
        return Promise.resolve({ id: '1', name: 'CategoryName' });
      }
      return Promise.resolve(null);
    }),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProductsService,
        {
          provide: getRepositoryToken(Product),
          useValue: mockProductRepository,
        },
        {
          provide: getRepositoryToken(ProductCategory),
          useValue: mockCategoryRepository,
        },
      ],
    }).compile();

    service = module.get<ProductsService>(ProductsService);
    productRepository = module.get<Repository<Product>>(getRepositoryToken(Product));
    categoryRepository = module.get<Repository<ProductCategory>>(getRepositoryToken(ProductCategory));
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should create a product', async () => {
    const dto: CreateProductDto = {
      product_name: 'Product1',
      description: 'Product Description',
      price: 100,
      quantity: 10,
      categoryId: '1',
    };

    const product = await service.createProduct(dto);

    expect(product).toEqual({
      id: '1',
      product_name: dto.product_name,
      description: dto.description,
      price: dto.price,
      quantity: dto.quantity,
      category: { id: '1', name: 'CategoryName' },
      categoryId: '1',
    });
    expect(productRepository.create).toHaveBeenCalledWith(expect.objectContaining(dto));
    expect(productRepository.save).toHaveBeenCalledWith(expect.objectContaining(dto));
  });

  it('should throw a NotFoundException if category does not exist', async () => {
    const dto: CreateProductDto = {
      product_name: 'Product1',
      description: 'Product Description',
      price: 100,
      quantity: 10,
      categoryId: '2',
    };

    await expect(service.createProduct(dto)).rejects.toThrow(NotFoundException);
    expect(categoryRepository.findOneBy).toHaveBeenCalledWith({ id: '2' });
  });
});
