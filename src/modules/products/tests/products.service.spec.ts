import { Test, TestingModule } from '@nestjs/testing';

import { getRepositoryToken } from '@nestjs/typeorm';

import { Repository } from 'typeorm';
import { ProductsService } from '../products.service';
import { Product, ProductStatusType } from '../entities/product.entity';
import { Organisation } from '../../../modules/organisations/entities/organisations.entity';
import { orgMock } from '../../../modules/organisations/tests/mocks/organisation.mock';
import { createProductRequestDtoMock } from './mocks/product-request-dto.mock';
import { productMock } from './mocks/product.mock';
import { HttpStatus, NotFoundException } from '@nestjs/common';
import { UpdateProductDTO } from '../dto/update-product.dto';

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
          useClass: Repository,
        },
        {
          provide: getRepositoryToken(Organisation),
          useClass: Repository,
        },
      ],
    }).compile();

    service = module.get<ProductsService>(ProductsService);
    productRepository = module.get<Repository<Product>>(getRepositoryToken(Product));
    organisationRepository = module.get<Repository<Organisation>>(getRepositoryToken(Organisation));
  });

  it('should create a new product', async () => {
    jest.spyOn(organisationRepository, 'findOne').mockResolvedValue(orgMock);
    jest.spyOn(productRepository, 'create').mockReturnValue(createProductRequestDtoMock as any);
    jest.spyOn(productRepository, 'save').mockResolvedValue(productMock as any);

    const createdProduct = await service.createProduct(orgMock.id, createProductRequestDtoMock);

    expect(createdProduct.message).toEqual('Product created successfully');
    expect(createdProduct.status).toEqual('success');
  });

  describe('Update product PUT: /api/v1/products/:productId', () => {
    it('should throw an error if product is not found', async () => {
      jest.spyOn(productRepository, 'findOne').mockResolvedValue(null);

      await expect(service.updateProduct('123hsb', new UpdateProductDTO())).rejects.toThrow(NotFoundException);
    });
  });

  describe('Get product stock GET: /api/v1/products/:productId/stock', () => {
    it('should throw an error if product is not found', async () => {
      jest.spyOn(productRepository, 'findOne').mockResolvedValue(null);

      await expect(service.getProductStock('123hsb')).rejects.toThrow(NotFoundException);
    });

    it('should retrieve current product stock', async () => {
      const product = {
        id: '123hgdt',
        name: 'Product 1',
        description: 'Description for product 1',
        quantity: 10,
        price: 5000,
        image: '',
        org: orgMock.id,
        status: ProductStatusType.IN_STOCK,
        created_at: new Date(),
        updated_at: new Date(),
      };

      jest.spyOn(organisationRepository, 'findOne').mockResolvedValue(orgMock);
      jest.spyOn(productRepository, 'findOne').mockResolvedValue(product as any);

      const getProduct = await service.getProductStock('123hgdt');

      expect(getProduct).toEqual({
        status_code: HttpStatus.OK,
        message: 'Product stock retrieved successfully',
        data: {
          productId: '123hgdt',
          current_stock: 10,
          last_updated: product.updated_at,
        },
      });
    });
  });
});
