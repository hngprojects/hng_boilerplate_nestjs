import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { ProductSearchController } from './product-search.controller';
import { ProductSearchService } from './product-search.service';
import { Product } from '../entities/product.entity';
import { User } from '../entities/user.entity';

describe('ProductSearchController', () => {
  let app: INestApplication;
  let productService: ProductSearchService;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      controllers: [ProductSearchController],
      providers: [
        {
          provide: ProductSearchService,
          useValue: {
            searchProducts: jest.fn(),
          },
        },
      ],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();

    productService = moduleFixture.get<ProductSearchService>(ProductSearchService);
  });

  afterAll(async () => {
    await app.close();
  });

  it('should return products based on search criteria', async () => {
    const products: Product[] = [
      { id: 'uid1', product_name: 'Product A', description: 'Decription A', product_price: 100, user: new User() },
      { id: 'uid2', product_name: 'Product B', description: 'Decription B', product_price: 200, user: new User() },
    ];

    jest.spyOn(productService, 'searchProducts').mockResolvedValue(products);

    const response = await request(app.getHttpServer()).get('/products/search').query({ name: 'Product' });

    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      success: true,
      statusCode: 200,
      products,
    });
  });

  it('should return no content response on empty search query', async () => {
    const products: Product[] = [];

    jest.spyOn(productService, 'searchProducts').mockResolvedValue(products);

    const response = await request(app.getHttpServer()).get('/products/search').query({ name: "I don't exist" });

    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      success: true,
      statusCode: 204,
      products: [],
    });
  });

  it('should return 400 for invalid "minPrice" parameter', async () => {
    const response = await request(app.getHttpServer()).get('/products/search').query({ minPrice: 'invalid' });

    expect(response.status).toBe(400);
    expect(response.body.message).toBe('Invalid "minPrice" parameter. MinPrice must be a number.');
  });

  it('should return 400 for invalid "maxPrice" parameter', async () => {
    const response = await request(app.getHttpServer()).get('/products/search').query({ maxPrice: 'invalid' });

    expect(response.status).toBe(400);
    expect(response.body.message).toBe('Invalid "maxPrice" parameter. MaxPrice must be a number.');
  });

  it('should return 400 for invalid "maxPrice"parameter less than "minPrice" parameter', async () => {
    const response = await request(app.getHttpServer()).get('/products/search').query({ maxPrice: 100, minPrice: 300 });

    expect(response.status).toBe(400);
    expect(response.body.message).toBe(
      'Invalid "maxPrice" parameter. MaxPrice should be greater than or equal to MinPrice.'
    );
  });

  it('should handle service errors gracefully', async () => {
    jest.spyOn(productService, 'searchProducts').mockRejectedValue(new Error('Service error'));

    const response = await request(app.getHttpServer()).get('/products/search').query({ name: 'Product' });

    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      success: false,
      statusCode: 500,
      error: 'An unexpected error occurred. Please try again later.',
    });
  });
});
