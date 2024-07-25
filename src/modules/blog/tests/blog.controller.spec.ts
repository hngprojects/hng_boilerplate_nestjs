import { Test, TestingModule } from '@nestjs/testing';
import { BlogController } from '../controllers/blog.controller';
import { BlogService } from '../services/blog.service';
import { CreateBlogDto } from '../dto/create-blog.dto';
import { Blog } from '../entities/blog.entity';
import { HttpStatus } from '@nestjs/common';
import { AuthGuard } from '../../../guards/auth.guard';
import { JwtService } from '@nestjs/jwt';
import { Reflector } from '@nestjs/core';

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
        {
          provide: JwtService,
          useValue: {
            verifyAsync: jest.fn().mockResolvedValue({ id: 'userId', username: 'testuser' }),
          },
        },
        Reflector,
      ],
    })
      .overrideGuard(AuthGuard)
      .useClass(AuthGuard)
      .compile();

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

  // describe('fetchLatestBlogs', () => {
  //   it('should fetch latest blogs and return a success response', async () => {

  //     const result = await controller.fetchLatestBlogs(1, 10);

  //     expect(result).toEqual({
  //       count: expect.any(Number),
  //       next: null,
  //       previous: null,
  //       results: expect.arrayContaining([
  //         expect.objectContaining({
  //           title: expect.any(String),
  //           excerpt: expect.any(String),
  //           publish_date: expect.any(Date),
  //           author: expect.any(String),
  //         }),
  //       ]),
  //     });
  //   });

  //   it('should handle errors and return an error response', async () => {
  //     jest.spyOn(service, 'fetchLatestBlogs').mockRejectedValue(new Error('Error fetching latest blogs'));

  //     try {
  //       await controller.fetchLatestBlogs(1, 10);
  //     } catch (error) {
  //       expect(error.response).toEqual({
  //         status: 'error',
  //         message: 'Error fetching latest blogs',
  //         status_code: HttpStatus.INTERNAL_SERVER_ERROR,
  //       });
  //     }
  //   });

  //   it('should return a bad request response for invalid pagination parameters', async () => {
  //     const page = -1;
  //     const pageSize = 10;

  //     try {
  //       await controller.fetchLatestBlogs(page, pageSize);
  //     } catch (error) {
  //       expect(error.response).toEqual({
  //         status: 'error',
  //         message: 'Invalid pagination parameters',
  //         status_code: HttpStatus.BAD_REQUEST,
  //       });
  //     }
  //   });
  // });

  // Other endpoint tests here
});
