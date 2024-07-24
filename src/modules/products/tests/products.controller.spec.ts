import { Test, TestingModule } from '@nestjs/testing';
import { ProductController } from '../products.controller';
import { ProductsService } from '../products.service';
import { INestApplication } from '@nestjs/common';
import { Product } from '../entities/product.entity';
import { request } from 'http';
import { PaginationQueryDto } from '../dto/ PaginationQueryDto';
import { AuthGuard } from '@nestjs/passport';
// import { request } from 'http';

describe('ProductsController (e2e)', () => {

  let app: INestApplication;
  let service: ProductsService;
  // let controller: ProductController;

  const mockProductsService = {
    findAll: jest.fn(),
    findOne: jest.fn(),
    remove: jest.fn(),
  };

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      controllers: [ProductController],
      providers: [
        {
          provide: ProductsService,
          useValue: mockProductsService,
        },
      ],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  it('/GET products', async () => {
    const result: Product[] = [new Product(), new Product()];
    mockProductsService.findAll.mockResolvedValue(result);

    return request(app.getHttpServer())
      .get('/products')
      .query({ page: 1, limit: 10 })
      .expect(200)
      .expect(result);
  });

  afterAll(async () => {
    await app.close();
  });
});



describe('ProductsController', () => {
  let controller: ProductController;
  let productsService: ProductsService;

  beforeEach(async () => {
    const mockProductsService = {
      findAll: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [ProductController],
      providers: [
        {
          provide: ProductsService,
          useValue: mockProductsService,
        },
      ],
    })
      .overrideGuard(AuthGuard)
      .useValue({ canActivate: jest.fn(() => true) })
      .compile();

    controller = module.get<ProductController>(ProductController);
    productsService = module.get<ProductsService>(ProductsService);
  });

  describe('findAll', () => {
    it('should return an array of products', async () => {
      const result = {
        success: true,
        message: 'Products retrieved successfully',
        products: [
          { id: 'prod1', product_name: 'Product 1' },
          { id: 'prod2', product_name: 'Product 2' },
        ],
        pagination: {
          totalItems: 2,
          totalPages: 1,
          currentPage: 1,
        },
        status_code: 200,
      };
      const paginationQuery: PaginationQueryDto = { limit: 10, page: 1 };

      jest.spyOn(productsService, 'findAll').mockResolvedValue(result);

      expect(await controller.findAll(paginationQuery)).toBe(result);
      expect(productsService.findAll).toHaveBeenCalledWith(paginationQuery);
    });

    it('should return a message when no products are available', async () => {
      const result = {
        message: 'No Product available',
      };
      const paginationQuery: PaginationQueryDto = { limit: 10, page: 1 };

      jest.spyOn(productsService, 'findAll').mockResolvedValue(result);

      expect(await controller.findAll(paginationQuery)).toBe(result);
      expect(productsService.findAll).toHaveBeenCalledWith(paginationQuery);
    });

    it('should use the AuthGuard', () => {
      const guards = Reflect.getMetadata('__guards__', ProductController.prototype.findAll);
      const guard = new guards[0]();
      expect(guard).toBeInstanceOf(AuthGuard);
    });
  });
});
