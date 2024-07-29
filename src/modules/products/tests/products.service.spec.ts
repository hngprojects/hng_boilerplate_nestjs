import { Test, TestingModule } from '@nestjs/testing';
import { ProductsService } from '../products.service';
import { Repository } from 'typeorm';
import { Product, StatusType } from '../../products/entities/product.entity';
import { getRepositoryToken } from '@nestjs/typeorm';
import { HttpStatus, InternalServerErrorException, NotFoundException, ForbiddenException } from '@nestjs/common';
import UserService from '../../../modules/user/user.service';

describe('ProductsService', () => {
  let service: ProductsService;
  let repository: Repository<Product>;

  const mockProduct = {
    id: '6',
    created_at: new Date('2024-07-24T14:22:35.443Z'),
    updated_at: new Date('2024-07-24T14:22:35.443Z'),
    product_name: 'Product 2',
    description: 'Description for Product 2',
    quantity: 20,
    price: 200,
    category: { id: '9' },
  };

  const mockRepository = {
    findOne: jest.fn(),
    save: jest.fn(),
  };
  const mockUserService = {
    getUserRecord: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProductsService,
        {
          provide: getRepositoryToken(Product),
          useValue: mockRepository,
        },
        {
          provide: UserService,
          useValue: mockUserService,
        },
      ],
    }).compile();

    service = module.get<ProductsService>(ProductsService);
    repository = module.get<Repository<Product>>(getRepositoryToken(Product));
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('fetchSingleProduct', () => {
    it('should return a product if it exists', async () => {
      mockRepository.findOne.mockResolvedValue(mockProduct);

      const result = await service.fetchSingleProduct('6');

      expect(result).toEqual({
        status_code: HttpStatus.OK,
        message: 'Product fetched successfully',
        data: {
          products: {
            id: mockProduct.id,
            product_name: mockProduct.product_name,
            description: mockProduct.description,
            quantity: mockProduct.quantity,
            price: mockProduct.price,
            category: mockProduct.category.id,
            created_at: mockProduct.created_at,
            updated_at: mockProduct.updated_at,
          },
        },
      });
    });

    it('should throw NotFoundException if product does not exist', async () => {
      const productId = '2';
      mockRepository.findOne.mockResolvedValue(undefined);

      await expect(service.fetchSingleProduct(productId)).rejects.toThrowError(NotFoundException);
      await expect(service.fetchSingleProduct(productId)).rejects.toThrowError(
        new NotFoundException({
          error: 'Product not found',
          status_code: 404,
        })
      );
    });

    it('should throw InternalServerErrorException on unexpected errors', async () => {
      const unexpectedError = new InternalServerErrorException();
      mockRepository.findOne.mockRejectedValue(unexpectedError);

      await expect(service.fetchSingleProduct('1')).rejects.toThrow(InternalServerErrorException);
    });
  });

  describe('changeProductStatus', () => {
    it('should update product status for super-admin', async () => {
      const productId = '123';
      const userId = '456';
      const newStatus = StatusType.DRAFT;

      const mockProduct = {
        id: productId,
        status: StatusType.ACTIVE,
      };

      const mockUser = {
        id: userId,
        user_type: 'super-admin',
      };

      mockRepository.findOne.mockResolvedValue(mockProduct);
      mockUserService.getUserRecord.mockResolvedValue(mockUser);
      mockRepository.save.mockResolvedValue({ ...mockProduct, status: newStatus });

      const result = await service.changeProductStatus(productId, userId, newStatus);

      expect(mockRepository.findOne).toHaveBeenCalledWith({
        where: { id: productId },
        relations: ['category'],
      });
      expect(mockUserService.getUserRecord).toHaveBeenCalledWith({ identifier: userId, identifierType: 'id' });
      expect(mockRepository.save).toHaveBeenCalledWith({ ...mockProduct, status: newStatus });
      expect(result).toEqual({
        message: 'Product status updated successfully',
        status_code: HttpStatus.OK,
        data: { ...mockProduct, status: newStatus },
      });
    });

    it('should throw NotFoundException if product is not found', async () => {
      mockRepository.findOne.mockResolvedValue(null);

      await expect(service.changeProductStatus('123', '456', StatusType.DRAFT)).rejects.toThrow(NotFoundException);
    });

    it('should throw ForbiddenException if user is not super-admin', async () => {
      const mockProduct = { id: '123', status: StatusType.ACTIVE };
      const mockUser = { id: '456', user_type: 'vendor' };

      mockRepository.findOne.mockResolvedValue(mockProduct);
      mockUserService.getUserRecord.mockResolvedValue(mockUser);

      await expect(service.changeProductStatus('123', '456', StatusType.DRAFT)).rejects.toThrow(ForbiddenException);
    });
  });
});
