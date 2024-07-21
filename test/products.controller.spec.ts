import { Test, TestingModule } from '@nestjs/testing';
import { ProductsController } from './products.controller';
import { ProductsService } from './products.service';
import { BadRequestException } from '@nestjs/common';

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

    jest.mock(service, 'searchProducts', () => Promise.resolve({ total: 1, results }));

    const response = await controller.search(query, 1, 10);

    expect(response).toEqual({
      page: 1,
      limit: 10,
      total: 1,
      results,
    });
  });

  it('should handle pagination correctly', async () => {
    const query = 'test';
    const results = [
      {
        id: 1,
        name: 'Test Product 1',
        description: 'Description for Test Product 1',
        category: 'Test Category',
        tags: ['test', 'product'],
      },
    ];

    jest.mock(service, 'searchProducts', () => Promise.resolve({ total: 1, results }));

    const response = await controller.search(query, 1, 1);

    expect(response).toEqual({
      page: 1,
      limit: 1,
      total: 1,
      results,
    });
  });

  it('should return empty results if no products match', async () => {
    const query = 'nonexistent';

    jest.mock(service, 'searchProducts', () => Promise.resolve({ total: 0, results: [] }));

    const response = await controller.search(query, 1, 10);

    expect(response).toEqual({
      page: 1,
      limit: 10,
      total: 0,
      results: [],
    });
  });

  it('should throw BadRequestException for invalid query parameter', async () => {
    await expect(controller.search('', 1, 10)).rejects.toThrow(BadRequestException);
  });
});