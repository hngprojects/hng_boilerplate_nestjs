import { Test, TestingModule } from '@nestjs/testing';
import { BlogService } from '../blog.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Blog } from '../entities/blog.entity';
import UserService from '../../user/user.service';
import { Category } from '../../category/entities/category.entity';
import { NotFoundException, HttpException, HttpStatus } from '@nestjs/common';
import { Repository } from 'typeorm';
import { UpdateBlogDto } from '../dto/update-blog.dto';

const mockBlogRepository = () => ({
  find: jest.fn(),
  findOne: jest.fn(),
  create: jest.fn(),
  save: jest.fn(),
  remove: jest.fn(),
});

const mockCategoryRepository = () => ({
  findOne: jest.fn(),
});

const mockUserService = {
  findByUserName: jest.fn(),
};

describe('BlogService', () => {
  let service: BlogService;
  let blogRepository;
  let categoryRepository;
  let userService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        BlogService,
        { provide: getRepositoryToken(Blog), useFactory: mockBlogRepository },
        { provide: getRepositoryToken(Category), useFactory: mockCategoryRepository },
        { provide: UserService, useValue: mockUserService },
      ],
    }).compile();

    service = module.get<BlogService>(BlogService);
    blogRepository = module.get<Repository<Blog>>(getRepositoryToken(Blog));
    categoryRepository = module.get<Repository<Category>>(getRepositoryToken(Category));
    userService = module.get<UserService>(UserService);
  });

  describe('findAll', () => {
    it('should return an array of blogs', async () => {
      const blogs = [new Blog()];
      blogRepository.find.mockResolvedValue(blogs);

      expect(blogRepository.find).not.toHaveBeenCalled();
      const result = await service.findAll();
      expect(blogRepository.find).toHaveBeenCalled();
      expect(result).toEqual(blogs);
    });
  });

  describe('getBlogById', () => {
    it('should retrieve and return the blog if found', async () => {
      const id = 'someBlogId';
      const blog = new Blog();
      blogRepository.findOne.mockResolvedValue(blog);

      expect(blogRepository.findOne).not.toHaveBeenCalled();
      const result = await service.getBlogById(id);
      expect(blogRepository.findOne).toHaveBeenCalledWith({ where: { id }, relations: ['user', 'category'] });
      expect(result).toEqual(blog);
    });

    it('should throw a NotFoundException if blog not found', async () => {
      const id = 'someBlogId';
      blogRepository.findOne.mockResolvedValue(null);

      await expect(service.getBlogById(id)).rejects.toThrow(NotFoundException);
    });
  });

  describe('updateBlogPost', () => {
    it('should update the blog if found', async () => {
      const id = 'someBlogId';
      const updateBlogDto = { title: 'New Title', content: 'New Content', author: 'author' };
      const blog = new Blog();
      blogRepository.findOne.mockResolvedValue(blog);
      blogRepository.save.mockResolvedValue(blog);

      const result = await service.updateBlogPost(id, updateBlogDto);
      expect(blogRepository.findOne).toHaveBeenCalledWith({ where: { id }, relations: ['user', 'category'] });
      expect(blogRepository.save).toHaveBeenCalledWith(blog);
      expect(result).toEqual(blog);
    });

    it('should throw a NotFoundException if blog not found', async () => {
      const id = 'someBlogId';
      blogRepository.findOne.mockResolvedValue(null);

      await expect(service.updateBlogPost(id, { title: 'New Title', author: 'author' })).rejects.toThrow(
        NotFoundException
      );
    });

    it('should throw a NotFoundException if category not found', async () => {
      const id = 'someBlogId';
      const updateBlogDto = { category_id: 'someCategoryId', author: 'author' };
      const blog = new Blog();
      blogRepository.findOne.mockResolvedValue(blog);
      categoryRepository.findOne.mockResolvedValue(null);

      await expect(service.updateBlogPost(id, updateBlogDto)).rejects.toThrow(NotFoundException);
    });
  });

  describe('deleteBlogPost', () => {
    it('should delete the blog if found', async () => {
      const id = 'someBlogId';
      const blog = new Blog();
      blogRepository.findOne.mockResolvedValue(blog);

      await service.deleteBlogPost(id);
      expect(blogRepository.findOne).toHaveBeenCalledWith({ where: { id } });
      expect(blogRepository.remove).toHaveBeenCalledWith(blog);
    });

    it('should throw a NotFoundException if blog not found', async () => {
      const id = 'someBlogId';
      blogRepository.findOne.mockResolvedValue(null);

      await expect(service.deleteBlogPost(id)).rejects.toThrow(NotFoundException);
    });

    it('should throw an HttpException if an error occurs during deletion', async () => {
      const id = 'someBlogId';
      const blog = new Blog();
      blogRepository.findOne.mockResolvedValue(blog);
      blogRepository.remove.mockRejectedValue(new Error('Deletion Error'));

      await expect(service.deleteBlogPost(id)).rejects.toThrow(HttpException);
    });
  });
});
