import { Test, TestingModule } from '@nestjs/testing';
import { BlogController } from '../controllers/blog.controller';
import { BlogService } from '../services/blog.service';
import { CreateBlogDto } from '../dto/create-blog.dto';
import { Blog } from '../entities/blog.entity';
import { HttpStatus } from '@nestjs/common';

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
    it('should create a blog and return a success response', async () => {
      const createBlogDto: CreateBlogDto = {
        title: 'Test Blog',
        image_url: 'http://example.com/image.jpg',
        content: 'Test content',
        authorId: 'authoruid',
        isPublished: true,
        categoryId: 'categoryuid',
      };

      const blog = new Blog();
      jest.spyOn(service, 'create').mockResolvedValue(blog);

      expect(await controller.create(createBlogDto)).toEqual({
        status: 'success',
        message: 'Blog created successfully',
        status_code: HttpStatus.CREATED,
        data: blog,
      });
    });

    it('should return an error response if creation fails', async () => {
      const createBlogDto: CreateBlogDto = {
        title: 'Test Blog',
        image_url: 'http://example.com/image.jpg',
        content: 'Test content',
        authorId: 'authoruid',
        isPublished: true,
        categoryId: 'categoryuid',
      };

      jest.spyOn(service, 'create').mockRejectedValue(new Error('Error creating blog'));

      try {
        await controller.create(createBlogDto);
      } catch (error) {
        expect(error.response).toEqual({
          status: 'error',
          message: 'Error creating blog',
          status_code: HttpStatus.BAD_REQUEST,
        });
      }
    });
  });
});
