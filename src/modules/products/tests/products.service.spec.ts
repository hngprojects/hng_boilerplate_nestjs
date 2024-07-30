import { Test, TestingModule } from '@nestjs/testing';
import { ProductsService } from '../products.service';
import { Repository } from 'typeorm';
import { Product, StatusType } from '../../products/entities/product.entity';
import { getRepositoryToken } from '@nestjs/typeorm';
import { HttpStatus, NotFoundException, ForbiddenException } from '@nestjs/common';
import UserService from '../../../modules/user/user.service';
import { productMock } from './mocks/product.mock';
import { createProductRequestDtoMock } from './mocks/product-request-dto.mock';

describe('ProductsService', () => {
  let service: ProductsService;
  let repository: Repository<Product>;

  const mockUserService = {
    getUserRecord: jest.fn(),
  };

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
          },
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

      (repository.findOne as jest.Mock).mockResolvedValue(mockProduct);
      mockUserService.getUserRecord.mockResolvedValue(mockUser);
      (repository.save as jest.Mock).mockResolvedValue({ ...mockProduct, status: newStatus });

      const result = await service.changeProductStatus(productId, userId, newStatus);

      expect(repository.findOne).toHaveBeenCalledWith({
        where: { id: productId },
      });
      expect(mockUserService.getUserRecord).toHaveBeenCalledWith({ identifier: userId, identifierType: 'id' });
      expect(repository.save).toHaveBeenCalledWith({ ...mockProduct, status: newStatus });
      expect(result).toEqual({
        message: 'Product status updated successfully',
        status_code: HttpStatus.OK,
        data: { ...mockProduct, status: newStatus },
      });
    });

    it('should throw NotFoundException if product is not found', async () => {
      (repository.findOne as jest.Mock).mockResolvedValue(null);

      await expect(service.changeProductStatus('123', '456', StatusType.DRAFT)).rejects.toThrow(NotFoundException);
    });

    it('should throw ForbiddenException if user is not super-admin', async () => {
      const mockProduct = { id: '123', status: StatusType.ACTIVE };
      const mockUser = { id: '456', user_type: 'vendor' };

      (repository.findOne as jest.Mock).mockResolvedValue(mockProduct);
      mockUserService.getUserRecord.mockResolvedValue(mockUser);

      await expect(service.changeProductStatus('123', '456', StatusType.DRAFT)).rejects.toThrow(ForbiddenException);
    });
  });
});
