import { Test, TestingModule } from '@nestjs/testing';
import { ProductsService } from '../products.service';
import { Repository } from 'typeorm';
import { Product, StatusType } from '../../products/entities/product.entity';
import { getRepositoryToken } from '@nestjs/typeorm';
import { HttpStatus, NotFoundException, ForbiddenException } from '@nestjs/common';
import UserService from '../../../modules/user/user.service';
import { productMock } from './mocks/product.mock';
import { Organisation } from '../../../modules/organisations/entities/organisations.entity';
import { orgMock } from '../../../modules/organisations/tests/mocks/organisation.mock';
import { createProductRequestDtoMock } from './mocks/product-request-dto.mock';

describe('ProductsService', () => {
  let service: ProductsService;
  let productRepository: Repository<Product>;
  let organisationRepository: Repository<Organisation>;

  const mockUserService = {
    getUserRecord: jest.fn(),
  };

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
          provide: UserService,
          useValue: mockUserService,
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

      jest.spyOn(productRepository, 'findOne').mockResolvedValue(mockProduct as any);
      mockUserService.getUserRecord.mockResolvedValue(mockUser);

      jest.spyOn(productRepository, 'save').mockResolvedValue(mockProduct as any);

      const result = await service.changeProductStatus(productId, userId, newStatus);

      expect(productRepository.findOne).toHaveBeenCalledWith({
        where: { id: productId },
      });
      expect(mockUserService.getUserRecord).toHaveBeenCalledWith({ identifier: userId, identifierType: 'id' });
      expect(productRepository.save).toHaveBeenCalledWith({ ...mockProduct, status: newStatus });
      expect(result).toEqual({
        message: 'Product status updated successfully',
        status_code: HttpStatus.OK,
        data: { ...mockProduct, status: newStatus },
      });
    });

    it('should throw NotFoundException if product is not found', async () => {
      jest.spyOn(productRepository, 'findOne').mockResolvedValue(null);

      await expect(service.changeProductStatus('123', '456', StatusType.DRAFT)).rejects.toThrow(NotFoundException);
    });

    it('should throw ForbiddenException if user is not super-admin', async () => {
      const mockProduct = { id: '123', status: StatusType.ACTIVE };
      const mockUser = { id: '456', user_type: 'vendor' };

      jest.spyOn(productRepository, 'findOne').mockResolvedValue(mockProduct as any);
      mockUserService.getUserRecord.mockResolvedValue(mockUser);

      await expect(service.changeProductStatus('123', '456', StatusType.DRAFT)).rejects.toThrow(ForbiddenException);
    });
  });
});
