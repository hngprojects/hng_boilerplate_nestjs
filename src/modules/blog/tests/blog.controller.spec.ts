import { Test, TestingModule } from '@nestjs/testing';
import { BlogController } from '../controllers/blog.controller';
import { BlogService } from '../services/blog.service';
import { CreateBlogDto } from '../dto/create-blog.dto';
import { Blog } from '../entities/blog.entity';
import { BadRequestException, HttpStatus } from '@nestjs/common';
import { Repository } from 'typeorm';
import { getRepositoryToken } from '@nestjs/typeorm';

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

  describe('Blog search', () => {
    let blogController: BlogController;
    let blogService: BlogService;
    let blogRepository: Repository<Blog>;

    beforeEach(async () => {
      const module: TestingModule = await Test.createTestingModule({
        controllers: [BlogController],
        providers: [
          {
            provide: BlogService,
            useValue: {
              searchBlogs: jest.fn(),
            },
          },
        ],
      }).compile();

      blogController = module.get<BlogController>(BlogController);
      blogService = module.get<BlogService>(BlogService);
      blogRepository = module.get<Repository<Blog>>(getRepositoryToken(Blog));
    });

    it('should return bad request if no query parameter is provided', async () => {
      await expect(blogController.search('')).rejects.toThrow(BadRequestException);
    });

    it('should return an empty array if no blogs are found', async () => {
      jest.spyOn(blogService, 'searchBlogs').mockResolvedValue([]);

      const result = await blogController.search('nestjs');
      expect(result).toEqual([]);
    });

    it('should return an array of blogs if blogs are found', async () => {
      const mockBlogs = [
        {
          id: 1,
          title: 'Backend with NestJs',
          content: 'NestJs is a wrapper around Express but with better implementation',
          isPublished: true,
          createdAt: new Date(),
          updatedAt: new Date(),
          author: {},
          comments: [],
          category: { id: 1, name: 'Programming' },
          topic: { id: 1, name: 'Backend' },
        },
      ];

      jest.spyOn(blogRepository, 'createQueryBuilder').mockReturnValue({
        where: jest.fn().mockReturnThis(),
        getMany: jest.fn().mockResolvedValue(mockBlogs),
      } as any);

      const result = await blogService.searchBlogs('nestjs');
      expect(result).toEqual(mockBlogs);
    });
  });

  //Other Endpoint Tests Here
});
