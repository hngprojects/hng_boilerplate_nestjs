import { Test, TestingModule } from '@nestjs/testing';

import { getRepositoryToken } from '@nestjs/typeorm';

import { Repository } from 'typeorm';
import { ProductsService } from '../products.service';
import { Product, StockStatusType } from '../entities/product.entity';
import { Organisation } from '../../../modules/organisations/entities/organisations.entity';
import { orgMock } from '../../../modules/organisations/tests/mocks/organisation.mock';
import { createProductRequestDtoMock } from './mocks/product-request-dto.mock';
import { productMock } from './mocks/product.mock';
import { BadRequestException, HttpStatus, NotFoundException } from '@nestjs/common';
import { UpdateProductDTO } from '../dto/update-product.dto';
import { ProductVariant } from '../entities/product-variant.entity';
import { deletedProductMock } from './mocks/deleted-product.mock';

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
        {
          provide: getRepositoryToken(ProductVariant),
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
      jest.spyOn(organisationRepository, 'findOne').mockResolvedValue(orgMock);
      jest.spyOn(productRepository, 'findOne').mockResolvedValue(null);

      await expect(service.updateProduct(orgMock.id, '123hsb', new UpdateProductDTO())).rejects.toThrow(
        NotFoundException
      );
    });
  });

  describe('Delete a product', () => {
    it('should deletes a product', async () => {
      jest.spyOn(organisationRepository, 'findOne').mockResolvedValue(orgMock);
      jest.spyOn(productRepository, 'findOne').mockResolvedValue(productMock);
      jest.spyOn(productRepository, 'save').mockResolvedValue(deletedProductMock);
      const deletedProduct = await service.deleteProduct(orgMock.id, productMock.id);
      expect(productRepository.save).toHaveBeenCalledWith({ ...productMock, is_deleted: true });
    });
    it('should throw NotFoundException if product does not exist', async () => {
      jest.spyOn(organisationRepository, 'findOne').mockResolvedValue(orgMock);
      jest.spyOn(productRepository, 'findOne').mockResolvedValue(null);

      await expect(service.deleteProduct(orgMock.id, 'nonExistingProductId')).rejects.toThrow(NotFoundException);
    });

    it('should throw BadRequestException if product is already deleted', async () => {
      jest.spyOn(organisationRepository, 'findOne').mockResolvedValue(orgMock);
      jest.spyOn(productRepository, 'findOne').mockResolvedValue(deletedProductMock);

      await expect(service.deleteProduct(orgMock.id, deletedProductMock.id)).rejects.toThrow(BadRequestException);
    });
  });
});
