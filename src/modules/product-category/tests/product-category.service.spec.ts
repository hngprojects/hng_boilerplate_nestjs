import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { ProductCategoryService } from '../product-category.service';
import { ProductCategory } from '../entities/product-category.entity';
import { NotFoundException } from '@nestjs/common';
import { CreateProductCategoryDto } from '../dto/create-product-category.dto';
import { UpdateProductCategoryDto } from '../dto/update-product-category.dto';

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

  describe('findAll', () => {
    it('should return all categories', async () => {
      const categories = [{ id: '1', name: 'Category 1' }];
      mockQueryBuilder.getMany.mockResolvedValue(categories);

      const result = await service.getAllCategories();
      expect(result).toEqual(categories);
      expect(mockRepository.createQueryBuilder).toHaveBeenCalledWith('category');
    });

    it('should apply limit and offset', async () => {
      await service.getAllCategories(10, 5);
      expect(mockRepository.createQueryBuilder).toHaveBeenCalledWith('category');
      expect(mockQueryBuilder.take).toHaveBeenCalledWith(10);
      expect(mockQueryBuilder.skip).toHaveBeenCalledWith(5);
    });
  });

  describe('findOne', () => {
    it('should return a category if found', async () => {
      const category = { id: '1', name: 'Category 1' };
      mockRepository.findOneBy.mockResolvedValue(category);

      const result = await service.getCategoryById('1');
      expect(result).toEqual(category);
    });

    it('should throw NotFoundException if category not found', async () => {
      mockRepository.findOneBy.mockResolvedValue(null);

      await expect(service.getCategoryById('1')).rejects.toThrow(NotFoundException);
    });
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

  describe('update', () => {
    it('should update an existing category', async () => {
      const updateDto: UpdateProductCategoryDto = { name: 'Updated Category' };
      const existingCategory = { id: '1', name: 'Old Category' };
      const updatedCategory = { ...existingCategory, ...updateDto };
      mockRepository.findOneBy.mockResolvedValue(existingCategory);
      mockRepository.save.mockResolvedValue(updatedCategory);

      const result = await service.updateCategory('1', updateDto);
      expect(result).toEqual(updatedCategory);
    });

    it('should throw NotFoundException if category to update is not found', async () => {
      mockRepository.findOneBy.mockResolvedValue(null);

      await expect(service.updateCategory('1', { name: 'Updated' })).rejects.toThrow(NotFoundException);
    });
  });

  describe('remove', () => {
    it('should remove an existing category', async () => {
      const category = { id: '1', name: 'Category to Remove' };
      mockRepository.findOneBy.mockResolvedValue(category);

      await service.removeCategory('1');
      expect(mockRepository.remove).toHaveBeenCalledWith(category);
    });

    it('should throw NotFoundException if category to remove is not found', async () => {
      mockRepository.findOneBy.mockResolvedValue(null);

      await expect(service.removeCategory('1')).rejects.toThrow(NotFoundException);
    });
  });
});
