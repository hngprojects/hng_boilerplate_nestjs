import { Test, TestingModule } from '@nestjs/testing';
import { BlogCategoryController } from './blog-category.controller';
import { BlogCategoryService } from './blog-category.service';
import { BadRequestException, InternalServerErrorException } from '@nestjs/common';
import { CreateBlogCategoryDto } from './create-blog-category.dto';

// Mocking JwtAuthGuard and RolesGuard if needed
// import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
// import { RolesGuard } from '../../auth/guards/roles.guard';

describe('BlogCategoryController', () => {
  let controller: BlogCategoryController;
  let service: BlogCategoryService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [BlogCategoryController],
      providers: [
        {
          provide: BlogCategoryService,
          useValue: {
            createCategory: jest.fn(),
          },
        },
      ],
    })
      // If you have guards, mock or override them here
      // .overrideGuard(JwtAuthGuard)
      // .useValue({ canActivate: () => true })
      // .overrideGuard(RolesGuard)
      // .useValue({ canActivate: () => true })
      .compile();

    controller = module.get<BlogCategoryController>(BlogCategoryController);
    service = module.get<BlogCategoryService>(BlogCategoryService);
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
