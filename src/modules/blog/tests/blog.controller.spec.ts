import { Test, TestingModule } from '@nestjs/testing';
import { BlogController } from '../controllers/blog.controller';
import { BlogService } from '../services/blog.service';
import { CreateBlogDto } from '../dto/create-blog.dto';
import { HttpException, HttpStatus } from '@nestjs/common';

describe('BlogController', () => {
  let controller: BlogController;
  let service: BlogService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [BlogController],
      providers: [
        {
          provide: BlogService,
          useValue: {
            create: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<BlogController>(BlogController);
    service = module.get<BlogService>(BlogService);
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
