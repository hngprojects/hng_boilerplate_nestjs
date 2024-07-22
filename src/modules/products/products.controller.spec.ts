import { Test, TestingModule } from '@nestjs/testing';
import { ProductsController } from './products.controller';
import { ProductsService } from './products.service';
import { InternalServerErrorException, NotFoundException } from '@nestjs/common';

describe('ProductsController', () => {
  let controller: ProductsController;
  let service: ProductsService;

  const mockService = {
    fetchSingleProduct: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ProductsController],
      providers: [{ provide: ProductsService, useValue: mockService }],
    }).compile();

    controller = module.get<ProductsController>(ProductsController);
    service = module.get<ProductsService>(ProductsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('fetchSingleProduct', () => {
    it('should return a product successfully', async () => {
      const mockProduct = {
        status: 'success',
        message: 'Product fetched successfully',
        data: {
          id: '1',
          name: 'Test Product',
          description: 'Test Description',
          price: 100,
          category: '',
          available: '',
          created_at: '',
          updated_at: '',
        },
      };

      mockService.fetchSingleProduct.mockResolvedValue(mockProduct);

      const result = await controller.fetchSingleProduct('1');

      expect(result).toEqual(mockProduct);
    });
    it('should throw NotFoundException when service throws it', async () => {
      mockService.fetchSingleProduct.mockRejectedValue(new NotFoundException('Product not found'));

      await expect(controller.fetchSingleProduct('1')).rejects.toThrow(NotFoundException);
    });

    it('should throw InternalServerErrorException when service throws it', async () => {
      mockService.fetchSingleProduct.mockRejectedValue(
        new InternalServerErrorException('An unexpected error occurred')
      );

      await expect(controller.fetchSingleProduct('1')).rejects.toThrow(InternalServerErrorException);
    });
  });
});
