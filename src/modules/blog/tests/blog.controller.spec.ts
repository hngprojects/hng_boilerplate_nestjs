import { Test, TestingModule } from '@nestjs/testing';
import { createBlogPostController } from '../controllers/blog.controller';
import { BlogPostService } from '../services/blog.service';
import { CreateBlogDto } from '../dto/create-blog.dto';
import { HttpException, HttpStatus } from '@nestjs/common';

describe('createBlogPostController', () => {
  let controller: createBlogPostController;
  let service: BlogPostService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [createBlogPostController],
      providers: [
        {
          provide: BlogPostService,
          useValue: {
            create: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<createBlogPostController>(createBlogPostController);
    service = module.get<BlogPostService>(BlogPostService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('should return an error response if creation fails', async () => {
      const createBlogDto: CreateBlogDto = {
        title: 'Test Blog',
        image_url: 'http://example.com/image.jpg',
        content: 'Test content',
        authorId: 'authoruid',
        isPublished: true,
        categoryId: 'categoryuid',
      };

      const errorResponse = {
        status: 'error',
        message: 'Error creating blog',
        status_code: HttpStatus.BAD_REQUEST,
      };

      jest.spyOn(service, 'create').mockRejectedValue(new HttpException(errorResponse, HttpStatus.BAD_REQUEST));

      try {
        await controller.create(createBlogDto);
      } catch (error) {
        expect(error).toBeInstanceOf(HttpException);
        expect(error.response).toEqual(errorResponse);
      }
    });
  });
});
