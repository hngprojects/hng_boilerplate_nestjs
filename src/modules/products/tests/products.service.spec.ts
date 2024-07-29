import { Test, TestingModule } from '@nestjs/testing';
<<<<<<< HEAD

import { getRepositoryToken } from '@nestjs/typeorm';

import { Repository } from 'typeorm';
import { ProductsService } from '../products.service';
import { Product } from '../entities/product.entity';
import { Organisation } from '../../../modules/organisations/entities/organisations.entity';
import { orgMock } from '../../../modules/organisations/tests/mocks/organisation.mock';
import { createProductRequestDtoMock } from './mocks/product-request-dto.mock';
import { productMock } from './mocks/product.mock';
=======
import { ProductsService } from '../products.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Product } from '../entities/product.entity';
import { ProductCategory } from '../../product-category/entities/product-category.entity';
import { CreateProductDto } from '../dto/create-product.dto';
import { NotFoundException } from '@nestjs/common';
>>>>>>> 343fb59 (chore: Temporary commit to save changes)

describe('ProductsService', () => {
  let service: ProductsService;
  let productRepository: Repository<Product>;
<<<<<<< HEAD
  let organisationRepository: Repository<Organisation>;
=======
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
>>>>>>> 343fb59 (chore: Temporary commit to save changes)

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProductsService,
        {
          provide: getRepositoryToken(Product),
<<<<<<< HEAD
          useClass: Repository,
        },
        {
          provide: getRepositoryToken(Organisation),
          useClass: Repository,
=======
          useValue: mockProductRepository,
        },
        {
          provide: getRepositoryToken(ProductCategory),
          useValue: mockCategoryRepository,
>>>>>>> 343fb59 (chore: Temporary commit to save changes)
        },
      ],
    }).compile();

    service = module.get<ProductsService>(ProductsService);
    productRepository = module.get<Repository<Product>>(getRepositoryToken(Product));
<<<<<<< HEAD
    organisationRepository = module.get<Repository<Organisation>>(getRepositoryToken(Organisation));
=======
    categoryRepository = module.get<Repository<ProductCategory>>(getRepositoryToken(ProductCategory));
>>>>>>> 343fb59 (chore: Temporary commit to save changes)
  });

  it('should create a new product', async () => {
    jest.spyOn(organisationRepository, 'findOne').mockResolvedValue(orgMock);
    jest.spyOn(productRepository, 'create').mockReturnValue(createProductRequestDtoMock as any);
    jest.spyOn(productRepository, 'save').mockResolvedValue(productMock as any);

<<<<<<< HEAD
    const createdProduct = await service.createProduct(orgMock.id, createProductRequestDtoMock);

    expect(createdProduct.message).toEqual('Product created successfully');
    expect(createdProduct.status).toEqual('success');
=======
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
>>>>>>> 343fb59 (chore: Temporary commit to save changes)
  });
});
