import { Test, TestingModule } from '@nestjs/testing';
import { Repository } from 'typeorm';
import { getRepositoryToken } from '@nestjs/typeorm';
import { BadRequestException, InternalServerErrorException } from '@nestjs/common';
import { BlogCategoryService } from '../services/blog-category.service';
import { BlogCategory } from '../entities/blog-category.entity';
import { CreateBlogCategoryDto } from '../dto/create-blog-category.dto';

describe('BlogCategoryService', () => {
  let service: BlogCategoryService;
  let repository: Repository<BlogCategory>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        BlogCategoryService,
        {
          provide: getRepositoryToken(BlogCategory),
          useValue: {
            findOne: jest.fn(),
            create: jest.fn(),
            save: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<BlogCategoryService>(BlogCategoryService);
    repository = module.get<Repository<BlogCategory>>(getRepositoryToken(BlogCategory));
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('createCategory', () => {
    it('should successfully create a category', async () => {
      const createBlogCategoryDto: CreateBlogCategoryDto = { name: 'New Category' };
      const category = new BlogCategory();
      category.name = 'New Category';
      const savedCategory = { ...category };

      jest.spyOn(repository, 'findOne').mockResolvedValue(null); // No existing category
      jest.spyOn(repository, 'create').mockReturnValue(category);
      jest.spyOn(repository, 'save').mockResolvedValue(savedCategory);

      const result = await service.createCategory(createBlogCategoryDto);

      expect(result).toEqual({
        status: 'success',
        message: 'Blog category created successfully.',
        data: { name: savedCategory.name },
        status_code: 201,
      });
    });

    it('should throw BadRequestException if category already exists', async () => {
      const createBlogCategoryDto: CreateBlogCategoryDto = { name: 'Existing Category' };
      const existingCategory = new BlogCategory();
      existingCategory.name = 'Existing Category';

      jest.spyOn(repository, 'findOne').mockResolvedValue(existingCategory);

      try {
        await service.createCategory(createBlogCategoryDto);
      } catch (error) {
        expect(error).toBeInstanceOf(BadRequestException);
        expect(error.getResponse()).toEqual({
          status: 'error',
          message: 'Category name already exists.',
          status_code: 400,
        });
      }
    });

    it('should throw InternalServerErrorException if save fails', async () => {
      const createBlogCategoryDto: CreateBlogCategoryDto = { name: 'New Category' };
      jest.spyOn(repository, 'findOne').mockResolvedValue(null); // No existing category
      jest.spyOn(repository, 'create').mockReturnValue(new BlogCategory());
      jest.spyOn(repository, 'save').mockRejectedValue(new Error('Database error'));

      try {
        await service.createCategory(createBlogCategoryDto);
      } catch (error) {
        expect(error).toBeInstanceOf(InternalServerErrorException);
        expect(error.getResponse()).toEqual({
          status: 'error',
          message: 'Failed to create category.',
          status_code: 500,
        });
      }
    });
  });
});
