import { Test, TestingModule } from '@nestjs/testing';
import { ProductsController } from './products.controller';
import { ProductsService } from './products.service';
import { BadRequestException, InternalServerErrorException } from '@nestjs/common';

describe('ProductsController', () => {
  let controller: ProductsController;
  let service: ProductsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ProductsController],
      providers: [
        {
          provide: ProductsService,
          useValue: {
            searchProducts: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<ProductsController>(ProductsController);
    service = module.get<ProductsService>(ProductsService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should return search results', async () => {
    const query = 'test';
    const results = [
      {
        id: 1,
        name: 'Test Product',
        description: 'Description for Test Product',
        category: 'Test Category',
        tags: ['test', 'product'],
      },
    ];

    jest.spyOn(service, 'searchProducts').mockResolvedValue({ total: 1, results });

    const response = await controller.search(query, 1, 10);

    expect(response).toEqual({
      page: 1,
      limit: 10,
      total: 1,
      results,
    });
  });

  it('should throw BadRequestException for invalid query parameter', async () => {
    await expect(controller.search('', 1, 10)).rejects.toThrow(BadRequestException);
  });

  it('should handle server errors', async () => {
    jest.spyOn(service, 'searchProducts').mockRejectedValue(new Error('Something went wrong'));

    await expect(controller.search('test', 1, 10)).rejects.toThrow(InternalServerErrorException);
  });

  // Additional tests for pagination, no results, etc.
});
