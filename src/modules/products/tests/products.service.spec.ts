import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { EntityManager, Repository } from 'typeorm';
import { ProductsService } from '../products.service';
import { Product, StockStatusType } from '../entities/product.entity';
import { Organisation } from '../../../modules/organisations/entities/organisations.entity';
import { ProductVariant } from '../entities/product-variant.entity';
import { NotFoundException, InternalServerErrorException } from '@nestjs/common';
import { orgMock } from '../../../modules/organisations/tests/mocks/organisation.mock';
import { createProductRequestDtoMock } from './mocks/product-request-dto.mock';
import { productMock } from './mocks/product.mock';
import { UpdateProductDTO } from '../dto/update-product.dto';

describe('ProductsService', () => {
  let service: ProductsService;
  let productRepository: Repository<Product>;
  let organisationRepository: Repository<Organisation>;
  let entityManager: EntityManager;

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
        {
          provide: getRepositoryToken(EntityManager),
          useClass: EntityManager,
        },
      ],
    }).compile();

    service = module.get<ProductsService>(ProductsService);
    productRepository = module.get<Repository<Product>>(getRepositoryToken(Product));
    organisationRepository = module.get<Repository<Organisation>>(getRepositoryToken(Organisation));
    entityManager = module.get<EntityManager>(getRepositoryToken(EntityManager));
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

  describe('deleteProduct', () => {
    it('should throw NotFoundException if product is not found', async () => {
      jest.spyOn(productRepository, 'findOne').mockResolvedValue(null);

      await expect(service.deleteProduct('invalid-id')).rejects.toThrow(NotFoundException);
    });

    it('should remove the product, which cascades to its variants', async () => {
      const product = { id: 'valid-id', variants: [{ id: 'variant-id-1' }, { id: 'variant-id-2' }] } as Product;
      jest.spyOn(productRepository, 'findOne').mockResolvedValue(product);
      jest.spyOn(productRepository, 'remove').mockResolvedValue(undefined);

      await service.deleteProduct('valid-id');

      expect(productRepository.remove).toHaveBeenCalledWith(product);
    });

    it('should throw InternalServerErrorException if an unexpected error occurs', async () => {
      jest.spyOn(productRepository, 'findOne').mockRejectedValue(new Error('Unexpected error'));

      await expect(service.deleteProduct('valid-id')).rejects.toThrow(InternalServerErrorException);
    });
  });
});
