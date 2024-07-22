import { Test, TestingModule } from '@nestjs/testing';
import { BlogsController } from './blogs.controller';
import { BlogsService } from './blogs.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Blog } from './entities/blog.entity';
import { HttpException, HttpStatus } from '@nestjs/common';
import { CreateBlogDto } from './dto/create-blog.dto';

describe('BlogsController', () => {
  let controller: BlogsController;
  let service: BlogsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [BlogsController],
      providers: [
        BlogsService,
        {
          provide: getRepositoryToken(Blog),
          useValue: {
            create: jest.fn(),
            save: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<BlogsController>(BlogsController);
    service = module.get<BlogsService>(BlogsService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('should create a blog post with valid data', async () => {
      const createBlogDto: CreateBlogDto = {
        title: 'Test Blog',
        content: 'This is a test blog post',
        tags: ['test', 'blog'],
        image_urls: ['http://example.com/image.jpg'],
      };

      const createdBlog = {
        id: 'some-uuid',
        ...createBlogDto,
        author: 'Test Author',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      jest.spyOn(service, 'create').mockResolvedValue(createdBlog as Blog);

      const result = await controller.create(createBlogDto, {} as any);

      expect(result.status_code).toBe(HttpStatus.CREATED);
      expect(result.message).toBe('Blog post created successfully');
      expect(result.data).toEqual({
        blog_id: createdBlog.id,
        title: createdBlog.title,
        content: createdBlog.content,
        image_urls: createdBlog.image_urls,
        tags: createdBlog.tags,
        author: createdBlog.author,
        created_at: createdBlog.createdAt,
      });
    });

    it('should throw BadRequestException when title is missing', async () => {
      const invalidDto = {
        content: 'This is a test blog post',
      };

      await expect(controller.create(invalidDto as CreateBlogDto, {} as any)).rejects.toThrow(HttpException);
    });

    it('should throw BadRequestException when content is missing', async () => {
      const invalidDto = {
        title: 'Test Blog',
      };

      await expect(controller.create(invalidDto as CreateBlogDto, {} as any)).rejects.toThrow(HttpException);
    });

    it('should handle internal server error', async () => {
      const createBlogDto: CreateBlogDto = {
        title: 'Test Blog',
        content: '<p>This is a test blog post</p>',
      };

      jest.spyOn(service, 'create').mockRejectedValue(new Error('Database error'));

      await expect(controller.create(createBlogDto, {} as any)).rejects.toThrow(HttpException);
    });
  });
});
