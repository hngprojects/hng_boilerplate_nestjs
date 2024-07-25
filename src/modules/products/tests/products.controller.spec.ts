import { Test, TestingModule } from '@nestjs/testing';
import { ProductController } from '../products.controller';
import { ProductsService } from '../products.service';
import { CreateProductDto } from '../dto/create-product.dto';
import { AuthGuard } from '../../../guards/auth.guard';

describe('ProductController', () => {
  let controller: ProductController;
  let service: ProductsService;

  const mockProductService = {
    createProduct: jest.fn(dto => {
      return {
        id: '1',
        product_name: dto.product_name,
        description: dto.description,
        price: dto.price,
        quantity: dto.quantity,
        category: { name: 'CategoryName' },
        created_at: new Date(),
        updated_at: new Date(),
      };
    }),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ProductController],
      providers: [
        {
          provide: ProductsService,
          useValue: mockProductService,
        },
      ],
    })
      .overrideGuard(AuthGuard)
      .useValue({ canActivate: jest.fn(() => true) })
      .compile();

    controller = module.get<ProductController>(ProductController);
    service = module.get<ProductsService>(ProductsService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should create a product', async () => {
    const dto: CreateProductDto = {
      product_name: 'Product1',
      description: 'Product Description',
      price: 100,
      quantity: 10,
      categoryId: '1',
    };

    const result = await controller.createProduct(dto, {});

    expect(result).toEqual({
      status: 'success',
      message: 'Product created successfully',
      data: {
        id: expect.any(String),
        name: dto.product_name,
        description: dto.description,
        price: dto.price,
        quantity: dto.quantity,
        category: 'CategoryName',
        created_at: expect.any(String),
        updated_at: expect.any(String),
      },
    });
    expect(service.createProduct).toHaveBeenCalledWith(dto);
  });
});
