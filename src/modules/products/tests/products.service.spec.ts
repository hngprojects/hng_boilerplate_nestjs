import { InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { DeleteResult, Repository, UpdateResult } from 'typeorm';
import { CustomHttpException } from '../../../helpers/custom-http-filter';
import { Comment } from '../../../modules/comments/entities/comments.entity';
import { Organisation } from '../../../modules/organisations/entities/organisations.entity';
import { orgMock } from '../../../modules/organisations/tests/mocks/organisation.mock';
import { User } from '../../../modules/user/entities/user.entity';
import { mockUser } from '../../../modules/user/tests/mocks/user.mock';
import { AddCommentDto } from '../../comments/dto/add-comment.dto';
import { UpdateProductDTO } from '../dto/update-product.dto';
import { ProductVariant } from '../entities/product-variant.entity';
import { Product } from '../entities/product.entity';
import { ProductsService } from '../products.service';
import { mockComment } from './mocks/comment.mock';
import { deletedProductMock } from './mocks/deleted-product.mock';
import { createProductRequestDtoMock } from './mocks/product-request-dto.mock';
import { productMock } from './mocks/product.mock';

describe('ProductsService', () => {
  let service: ProductsService;
  let productRepository: Repository<Product>;
  let organisationRepository: Repository<Organisation>;
  let userRepository: Repository<User>;
  let commentRepository: Repository<Comment>;

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
            softDelete: jest.fn(),
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
        {
          provide: getRepositoryToken(Comment),
          useValue: {
            createQueryBuilder: jest.fn(),
            create: jest.fn(),
            save: jest.fn(),
          },
        },
        {
          provide: getRepositoryToken(User),
          useClass: Repository,
        },
      ],
    }).compile();

    service = module.get<ProductsService>(ProductsService);
    productRepository = module.get<Repository<Product>>(getRepositoryToken(Product));
    organisationRepository = module.get<Repository<Organisation>>(getRepositoryToken(Organisation));
    userRepository = module.get<Repository<User>>(getRepositoryToken(User));
    commentRepository = module.get<Repository<Comment>>(getRepositoryToken(Comment));
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
      const deleteResult: UpdateResult = { raw: [], affected: 1, generatedMaps: [] };
      jest.spyOn(organisationRepository, 'findOne').mockResolvedValue(orgMock);
      jest.spyOn(productRepository, 'findOne').mockResolvedValue(productMock);
      jest.spyOn(productRepository, 'softDelete').mockResolvedValue(deleteResult);

      const result = await service.deleteProduct(orgMock.id, productMock.id);

      expect(result.message).toEqual('Product successfully deleted');
    });
  });

  describe('Add a comment under a product', () => {
    it('should add a comment successfully', async () => {
      const addCommentDto: AddCommentDto = {
        comment: 'New Comment',
      };

      jest.spyOn(userRepository, 'findOne').mockResolvedValue(mockUser);
      jest.spyOn(productRepository, 'findOne').mockResolvedValue(productMock);
      jest.spyOn(commentRepository, 'create').mockReturnValue(mockComment);
      jest.spyOn(commentRepository, 'save').mockResolvedValue(mockComment);

      const result = await service.addCommentToProduct(productMock.id, addCommentDto, mockUser.id);

      expect(result.message).toEqual('Comment added successfully');
      expect(result.data).toBeDefined();
    });

    it('should throw an error', async () => {
      const addCommentDto: AddCommentDto = {
        comment: 'New Comment',
      };

      jest.spyOn(userRepository, 'findOne').mockResolvedValue(mockUser);
      jest.spyOn(productRepository, 'findOne').mockResolvedValue(null);
      jest.spyOn(commentRepository, 'create').mockReturnValue(mockComment);
      jest.spyOn(commentRepository, 'save').mockResolvedValue(mockComment);

      await expect(service.addCommentToProduct(productMock.id, addCommentDto, mockUser.id)).rejects.toThrow(
        CustomHttpException
      );
    });
  });

  describe('getProductStock', () => {
    it('should return product stock details if the product is found', async () => {
      const productId = '123';
      const productMock = {
        id: productId,
        quantity: 20,
        updated_at: new Date(),
      };

      jest.spyOn(productRepository, 'findOne').mockResolvedValue(productMock as any);

      const result = await service.getProductStock(productId);

      expect(result).toEqual({
        message: 'Product stock retrieved successfully',
        data: {
          product_id: productMock.id,
          current_stock: productMock.quantity,
          last_updated: productMock.updated_at,
        },
      });
    });

    it('should throw NotFoundException if the product is not found', async () => {
      const productId = 'nonexistent';

      jest.spyOn(productRepository, 'findOne').mockResolvedValue(null);

      await expect(service.getProductStock(productId)).rejects.toThrow(new NotFoundException('Product not found'));
    });
  });

  describe('Get total products', () => {
    it('should return the total number of products and the equivalent percentage change', async () => {
      const mockMonthData = { total: '20' };
      const mockLastMonthData = { total: '10' };

      const queryBuilderMock = {
        select: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        getRawOne: jest.fn().mockResolvedValueOnce(mockMonthData).mockResolvedValueOnce(mockLastMonthData),
      };

      jest.spyOn(productRepository, 'createQueryBuilder').mockReturnValue(queryBuilderMock as any);

      const result = await service.getTotalProducts();

      expect(result).toEqual({
        message: 'Total Products fetched successfully',
        data: {
          total_products: 20,
          percentage_change: '+100.00% from last month',
        },
      });
    });

    it('should return 100% change when there were no products last month', async () => {
      const mockMonthData = { total: '20' };
      const mockLastMonthData = { total: '0' };

      const queryBuilderMock = {
        select: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        getRawOne: jest.fn().mockResolvedValueOnce(mockMonthData).mockResolvedValueOnce(mockLastMonthData),
      };

      jest.spyOn(productRepository, 'createQueryBuilder').mockReturnValue(queryBuilderMock as any);

      const result = await service.getTotalProducts();

      expect(result).toEqual({
        message: 'Total Products fetched successfully',
        data: {
          total_products: 20,
          percentage_change: '+100.00% from last month',
        },
      });
    });

    it('should return negative percentage change if fewer products this month', async () => {
      const mockMonthData = { total: '5' };
      const mockLastMonthData = { total: '10' };

      const queryBuilderMock = {
        select: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        getRawOne: jest.fn().mockResolvedValueOnce(mockMonthData).mockResolvedValueOnce(mockLastMonthData),
      };

      jest.spyOn(productRepository, 'createQueryBuilder').mockReturnValue(queryBuilderMock as any);

      const result = await service.getTotalProducts();

      expect(result).toEqual({
        message: 'Total Products fetched successfully',
        data: {
          total_products: 5,
          percentage_change: '-50.00% from last month',
        },
      });
    });
  });
});
