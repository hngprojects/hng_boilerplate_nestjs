import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { ProductCategoryService } from '../product-category.service';
import { ProductCategory } from '../entities/product-category.entity';
import { CreateProductCategoryDto } from '../dto/create-product-category.dto';

describe('ProductCategoryService', () => {
  let service: ProductCategoryService;
  let mockRepository;
  let mockQueryBuilder;

  beforeEach(async () => {
    mockQueryBuilder = {
      take: jest.fn().mockReturnThis(),
      skip: jest.fn().mockReturnThis(),
      getMany: jest.fn().mockResolvedValue([]),
    };

    mockRepository = {
      createQueryBuilder: jest.fn().mockReturnValue(mockQueryBuilder),
      find: jest.fn(),
      findOneBy: jest.fn(),
      create: jest.fn(),
      save: jest.fn(),
      remove: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProductCategoryService,
        {
          provide: getRepositoryToken(ProductCategory),
          useValue: mockRepository,
        },
      ],
    }).compile();

    service = module.get<ProductCategoryService>(ProductCategoryService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a new category', async () => {
      const createDto: CreateProductCategoryDto = { name: 'New Category' };
      const newCategory = { id: '1', ...createDto };
      mockRepository.create.mockReturnValue(newCategory);
      mockRepository.save.mockResolvedValue(newCategory);

      const result = await service.createCategory(createDto);
      expect(result).toEqual(newCategory);
    });
  });
});
