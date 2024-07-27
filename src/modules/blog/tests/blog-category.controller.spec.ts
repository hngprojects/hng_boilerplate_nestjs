import { Test, TestingModule } from '@nestjs/testing';
import { BlogPostCategoryController } from '../controllers/blog-category.controller';
import { BadRequestException, InternalServerErrorException } from '@nestjs/common';
import { BlogPostCategoryService } from '../services/blog-category.service';
import { CreateBlogCategoryDto } from '../dto/create-blog-category.dto';

describe('BlogCategoryController', () => {
  let controller: BlogPostCategoryController;
  let service: BlogPostCategoryService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [BlogPostCategoryController],
      providers: [
        {
          provide: BlogPostCategoryService,
          useValue: {
            createCategory: jest.fn(),
          },
        },
      ],
    })

      .compile();

    controller = module.get<BlogPostCategoryController>(BlogPostCategoryController);
    service = module.get<BlogPostCategoryService>(BlogPostCategoryService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('createCategory', () => {
    it('should create a category', async () => {
      const createBlogCategoryDto: CreateBlogCategoryDto = { name: 'Test Category' };
      const result = {
        status: 'success',
        message: 'Blog category created successfully.',
        data: { name: 'Test Category' },
        status_code: 201,
      };

      jest.spyOn(service, 'createCategory').mockResolvedValue(result);

      expect(await controller.createCategory(createBlogCategoryDto)).toEqual(result);
    });

    it('should throw an error if category name already exists', async () => {
      const createBlogCategoryDto: CreateBlogCategoryDto = { name: 'Existing Category' };
      const error = {
        status: 'error',
        message: 'Category name already exists.',
        status_code: 400,
      };

      jest.spyOn(service, 'createCategory').mockRejectedValue(new BadRequestException(error));

      try {
        await controller.createCategory(createBlogCategoryDto);
      } catch (e) {
        expect(e).toBeInstanceOf(BadRequestException);
        expect(e.getResponse()).toEqual(error);
      }
    });

    it('should throw an error if there is a server error', async () => {
      const createBlogCategoryDto: CreateBlogCategoryDto = { name: 'New Category' };
      const error = {
        status: 'error',
        message: 'Failed to create category.',
        status_code: 500,
      };

      jest.spyOn(service, 'createCategory').mockRejectedValue(new InternalServerErrorException(error));

      try {
        await controller.createCategory(createBlogCategoryDto);
      } catch (e) {
        expect(e).toBeInstanceOf(InternalServerErrorException);
        expect(e.getResponse()).toEqual(error);
      }
    });
  });
});
