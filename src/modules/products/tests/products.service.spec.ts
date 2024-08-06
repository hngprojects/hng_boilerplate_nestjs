import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ProductsService } from '../products.service';
import { Product, StockStatusType } from '../entities/product.entity';
import { Organisation } from '../../../modules/organisations/entities/organisations.entity';
import { ProductVariant } from '../entities/product-variant.entity';
import { NotFoundException, InternalServerErrorException } from '@nestjs/common';
import { orgMock } from '../../../modules/organisations/tests/mocks/organisation.mock';
import { createProductRequestDtoMock } from './mocks/product-request-dto.mock';
import { productMock } from './mocks/product.mock';
import { UpdateProductDTO } from '../dto/update-product.dto';
import { deletedProductMock } from './mocks/deleted-poruct.mock';

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
            createQueryBuilder: jest.fn(),
            findOne: jest.fn(),
            save: jest.fn(),
            create: jest.fn(),
            update: jest.fn(),
          },
        },
        {
          provide: getRepositoryToken(Organisation),
          useValue: {
            findOne: jest.fn(),
          },
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

  describe('searchProducts', () => {
    it('should return products based on name search', async () => {
      orgMock.products = [productMock];
      const searchCriteria = { name: 'Product 1' };
      const queryBuilderMock = {
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        getMany: jest.fn().mockResolvedValue([productMock]),
      };
      jest.spyOn(organisationRepository, 'findOne').mockResolvedValue(orgMock);
      jest.spyOn(productRepository, 'createQueryBuilder').mockReturnValue(queryBuilderMock as any);

      const products = await service.searchProducts(orgMock.id, searchCriteria);

      expect(products).toEqual({ success: true, statusCode: 200, products: [productMock] });
    });

    it('should return products based on price range search', async () => {
      orgMock.products = [productMock];
      const searchCriteria = { minPrice: 100, maxPrice: 200 };
      const queryBuilderMock = {
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        getMany: jest.fn().mockResolvedValue([productMock]),
      };
      jest.spyOn(organisationRepository, 'findOne').mockResolvedValue(orgMock);
      jest.spyOn(productRepository, 'createQueryBuilder').mockReturnValue(queryBuilderMock as any);

      const products = await service.searchProducts(orgMock.id, searchCriteria);

      expect(products).toEqual({ success: true, statusCode: 200, products: [productMock] });
    });

    it('should return products based on combined search criteria', async () => {
      orgMock.products = [productMock];
      const searchCriteria = { name: 'Product 1', minPrice: 100, maxPrice: 200 };
      const queryBuilderMock = {
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        getMany: jest.fn().mockResolvedValue([productMock]),
      };
      jest.spyOn(organisationRepository, 'findOne').mockResolvedValue(orgMock);
      jest.spyOn(productRepository, 'createQueryBuilder').mockReturnValue(queryBuilderMock as any);

      const products = await service.searchProducts(orgMock.id, searchCriteria);

      expect(products).toEqual({ success: true, statusCode: 200, products: [productMock] });
    });

    it('should throw NotFoundException if no products match search criteria', async () => {
      orgMock.products = [];
      const searchCriteria = { name: 'nonexistent' };
      const queryBuilderMock = {
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        getMany: jest.fn().mockResolvedValue([]),
      };
      jest.spyOn(organisationRepository, 'findOne').mockResolvedValue(orgMock);
      jest.spyOn(productRepository, 'createQueryBuilder').mockReturnValue(queryBuilderMock as any);

      await expect(service.searchProducts(orgMock.id, searchCriteria)).rejects.toThrow(
        new NotFoundException({ status: 'No Content', status_code: 204, message: 'No products found' })
      );
    });
  });

  describe('Update product', () => {
    it('should throw an error if product is not found', async () => {
      jest.spyOn(organisationRepository, 'findOne').mockResolvedValue(orgMock);
      jest.spyOn(productRepository, 'findOne').mockResolvedValue(null);

      await expect(service.updateProduct(orgMock.id, '123hsb', new UpdateProductDTO())).rejects.toThrow(
        NotFoundException
      );
    });

    it('should update the product successfully', async () => {
      jest.spyOn(organisationRepository, 'findOne').mockResolvedValue(orgMock);
      jest.spyOn(productRepository, 'findOne').mockResolvedValue(productMock as any);
      jest.spyOn(productRepository, 'update').mockResolvedValue({} as any);
      jest.spyOn(productRepository, 'save').mockResolvedValue(productMock as any);

      const updateProductDto = new UpdateProductDTO();
      updateProductDto.name = 'Updated Product';
      updateProductDto.quantity = 10;

      const result = await service.updateProduct(orgMock.id, productMock.id, updateProductDto);

      expect(result.message).toEqual('Product updated successfully');
      expect(result.data).toEqual(productMock);
    });

    it('should throw InternalServerErrorException if an unexpected error occurs', async () => {
      jest.spyOn(organisationRepository, 'findOne').mockResolvedValue(orgMock);
      jest.spyOn(productRepository, 'findOne').mockResolvedValue(productMock as any);
      jest.spyOn(productRepository, 'update').mockRejectedValue(new Error('Unexpected error'));

      await expect(service.updateProduct(orgMock.id, productMock.id, new UpdateProductDTO())).rejects.toThrow(
        InternalServerErrorException
      );
    });
  });

  describe('deleteProduct', () => {
    it('should delete the product successfully', async () => {
      jest.spyOn(organisationRepository, 'findOne').mockResolvedValue(orgMock);
      jest.spyOn(productRepository, 'findOne').mockResolvedValue(productMock);
      jest.spyOn(productRepository, 'save').mockResolvedValue(deletedProductMock);

      const result = await service.deleteProduct(orgMock.id, productMock.id);

      expect(result.message).toEqual('Product successfully deleted');
      expect(deletedProductMock.is_deleted).toBe(true);
    });
  });
});
