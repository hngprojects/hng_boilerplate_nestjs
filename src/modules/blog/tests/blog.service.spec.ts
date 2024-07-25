import { Test, TestingModule } from '@nestjs/testing';
import { BlogService } from '../services/blog.service';
import { Blog } from '../entities/blog.entity';
import { User } from '../../user/entities/user.entity';
import { BlogCategory } from '../entities/blog-category.entity';
import { Repository } from 'typeorm';
import { getRepositoryToken } from '@nestjs/typeorm';
import { NotFoundException } from '@nestjs/common';

describe('BlogService', () => {
  let service: BlogService;
  let blogRepository: Partial<jest.Mocked<Repository<Blog>>>;
  let userRepository: Partial<jest.Mocked<Repository<User>>>;
  let categoryRepository: Partial<jest.Mocked<Repository<BlogCategory>>>;

  beforeEach(async () => {
    blogRepository = {
      create: jest.fn(),
      save: jest.fn(),
      // findAndCount: jest.fn(),
    };
    userRepository = {
      findOne: jest.fn(),
    };
    categoryRepository = {
      findOne: jest.fn(),
    };
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        BlogService,
        { provide: getRepositoryToken(Blog), useValue: blogRepository },
        { provide: getRepositoryToken(User), useValue: userRepository },
        { provide: getRepositoryToken(BlogCategory), useValue: categoryRepository },
      ],
    }).compile();

    service = module.get<BlogService>(BlogService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should throw NotFoundException if author is not found', async () => {
      userRepository.findOne.mockResolvedValue(null);

      await expect(
        service.create({
          authorId: 'authoruid',
          categoryId: 'categoryuid',
          title: 'Test Blog',
          image_url: 'https/exemple.com/img.jpg',
          content: 'Test blog content lorren ipsum',
        })
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw NotFoundException if category is not found', async () => {
      userRepository.findOne.mockResolvedValue({ id: 'useruid' } as User);
      categoryRepository.findOne.mockResolvedValue(null);

      await expect(
        service.create({
          authorId: 'authoruid',
          categoryId: 'categoryuid',
          title: 'Test Blog',
          image_url: 'https/exemple.com/img.jpg',
          content: 'Test blog content lorren ipsum',
        })
      ).rejects.toThrow(NotFoundException);
    });

    it('should create and save a blog', async () => {
      const blogData = { title: 'Test Blog' };
      userRepository.findOne.mockResolvedValue({ id: 'useruid' } as User);
      categoryRepository.findOne.mockResolvedValue({ id: 'categoryuid' } as BlogCategory);
      blogRepository.create.mockReturnValue(blogData as Blog);
      blogRepository.save.mockResolvedValue(blogData as Blog);

      const result = await service.create({
        authorId: 'authoruid',
        categoryId: 'categoryuid',
        title: 'Test Blog',
        image_url: 'https/exemple.com/img.jpg',
        content: 'Test blog content lorren ipsum',
      });

      expect(result).toEqual(blogData);
      expect(blogRepository.create).toHaveBeenCalledWith({
        title: 'Test Blog',
        content: 'Test blog content lorren ipsum',
        image_url: 'https/exemple.com/img.jpg',
        author: { id: 'useruid' },
        category: { id: 'categoryuid' },
      });
      expect(blogRepository.save).toHaveBeenCalledWith(blogData);
    });
  });

  // describe('fetchLatestBlogs', () => {
  //   it('should return paginated latest blogs', async () => {
  //     const blogData = [
  //       {
  //         authorId: 'authoruid',
  //         categoryId: 'categoryuid',
  //         title: 'Test Blog',
  //         image_url: 'https/exemple.com/img.jpg',
  //         content: 'Test blog content lorren ipsum',
  //       },
  //       {
  //         authorId: 'authoruid',
  //         categoryId: 'categoryuid',
  //         title: 'Test Blog',
  //         image_url: 'https/exemple.com/img.jpg',
  //         content: 'Test blog content lorren ipsum',
  //       },
  //     ];
  //     userRepository.findOne.mockResolvedValue({ id: 'useruid' } as User);
  //     categoryRepository.findOne.mockResolvedValue({ id: 'categoryuid' } as BlogCategory);
  //     blogRepository.create.mockReturnValue(blogData as Blog);
  //     blogRepository.findAndCount.mockResolvedValue([blogData as unknown as Blog, 10]);

  //     // const blogs: Blog[] = [
  //     //   {
  //     //     title: 'Blog 1',
  //     //     content: 'Content 1',
  //     //     createdAt: new Date(),
  //     //     author: user,
  //     //     category: category,
  //     //   },
  //     //   {
  //     //     title: 'Blog 2',
  //     //     content: 'Content 2',
  //     //     createdAt: new Date(),
  //     //     author: user,
  //     //     category: category,
  //     //   },
  //     // ];

  //     // jest.spyOn(blogRepository, 'findAndCount').mockResolvedValue(blogs)
  //     const result = await service.fetchLatestBlogs(1, 10);

  //     expect(result).toBeDefined();
  //     expect(result.blogs).toHaveLength(2);
  //     expect(result.count).toBe(2);
  //   });

  //   it('should handle errors and throw an exception', async () => {
  //     jest.spyOn(blogRepository, 'findAndCount').mockRejectedValue(new Error('Error fetching latest blogs'));

  //     await expect(service.fetchLatestBlogs(1, 10)).rejects.toThrow('Error fetching latest blogs');
  //   });
  // });

  // Other service tests here
});
