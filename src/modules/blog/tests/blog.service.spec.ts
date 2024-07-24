import { Test, TestingModule } from '@nestjs/testing';
import { BlogService } from '../services/blog.service';
import { Blog } from '../entities/blog.entity';
import { User } from '../../user/entities/user.entity';
import { BlogCategory } from '../entities/blog-category.entity';
import { Repository } from 'typeorm';
import { getRepositoryToken } from '@nestjs/typeorm';
import { NotFoundException } from '@nestjs/common';
import { EditBlogDto } from '../dto/edit-blog.dto';

describe('BlogService', () => {
  let service: BlogService;
  let blogRepository: Partial<jest.Mocked<Repository<Blog>>>;
  let userRepository: Partial<jest.Mocked<Repository<User>>>;
  let categoryRepository: Partial<jest.Mocked<Repository<BlogCategory>>>;

  beforeEach(async () => {
    blogRepository = {
      create: jest.fn(),
      findOne: jest.fn(),
      save: jest.fn(),
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

  describe('editBlog', () => {
    it('should throw NotFoundException if blog post is not found', async () => {
      const id = 1;
      const updateData: EditBlogDto = { title: 'Updated Title' };

      blogRepository.findOne.mockResolvedValue(null);

      await expect(service.editBlog(id, updateData)).rejects.toThrow(NotFoundException);
    });

    it('should update and save the blog post', async () => {
      const id = 1;
      const updateData: EditBlogDto = { title: 'Updated Title', content: 'Updated Content' };

      const existingBlog = { id: '1', title: 'Old Title' } as Blog;

      blogRepository.findOne.mockResolvedValue(existingBlog);
      blogRepository.save.mockResolvedValue({ ...existingBlog, ...updateData });

      const updatedBlog = await service.editBlog(id, updateData);

      expect(updatedBlog).toEqual({ ...existingBlog, ...updateData });
      expect(blogRepository.save).toHaveBeenCalledWith({ ...existingBlog, ...updateData });
    });
  });
});
