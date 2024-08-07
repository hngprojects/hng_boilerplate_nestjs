import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BlogService } from '../blogs.service';
import { Blog } from '../entities/blog.entity';
import { User } from '../../user/entities/user.entity';
import { BadRequestException } from '@nestjs/common';

describe('BlogService', () => {
  let service: BlogService;
  let blogRepository: Repository<Blog>;
  let userRepository: Repository<User>;

  const mockUserRepository = () => ({
    findOne: jest.fn(),
  });

  const mockBlogRepository = () => ({
    create: jest.fn(),
    save: jest.fn(),
    findAndCount: jest.fn(),
  });

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        BlogService,
        { provide: getRepositoryToken(Blog), useFactory: mockBlogRepository },
        { provide: getRepositoryToken(User), useFactory: mockUserRepository },
      ],
    }).compile();

    service = module.get<BlogService>(BlogService);
    blogRepository = module.get<Repository<Blog>>(getRepositoryToken(Blog));
    userRepository = module.get<Repository<User>>(getRepositoryToken(User));
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('createBlog', () => {
    it('should successfully create a blog', async () => {
      const createBlogDto = {
        title: 'Test Blog',
        content: 'Test Content',
        tags: ['test'],
        image_urls: ['http://example.com/image.jpg'],
      };

      const user = new User();
      user.id = 'user-id';
      user.first_name = 'John';
      user.last_name = 'Doe';

      const fullUser = { first_name: 'John', last_name: 'Doe' };

      const blog = new Blog();
      blog.id = 'blog-id';
      blog.title = 'Test Blog';
      blog.content = 'Test Content';
      blog.tags = ['test'];
      blog.image_urls = ['http://example.com/image.jpg'];
      blog.author = fullUser as unknown as User;
      blog.created_at = new Date();
      blog.updated_at = new Date();

      const expectedResponse = {
        blog_id: 'blog-id',
        title: 'Test Blog',
        content: 'Test Content',
        tags: ['test'],
        image_urls: ['http://example.com/image.jpg'],
        author: 'John Doe',
        created_at: blog.created_at,
      };

      jest.spyOn(userRepository, 'findOne').mockResolvedValue(fullUser as unknown as User);
      jest.spyOn(blogRepository, 'create').mockReturnValue(blog);
      jest.spyOn(blogRepository, 'save').mockResolvedValue(blog);

      const result = await service.createBlog(createBlogDto, user);

      expect(result).toEqual(expectedResponse);
      expect(userRepository.findOne).toHaveBeenCalledWith({
        where: { id: user.id },
        select: ['first_name', 'last_name'],
      });
      expect(blogRepository.create).toHaveBeenCalledWith({
        ...createBlogDto,
        author: fullUser,
      });
      expect(blogRepository.save).toHaveBeenCalledWith(blog);
    });

    it('should throw an error if user not found', async () => {
      const createBlogDto = {
        title: 'Test Blog',
        content: 'Test Content',
        tags: ['test'],
        image_urls: ['http://example.com/image.jpg'],
      };

      const user = new User();
      user.id = 'user-id';

      jest.spyOn(userRepository, 'findOne').mockResolvedValue(null);

      await expect(service.createBlog(createBlogDto, user)).rejects.toThrowError('User not found');
    });
  });

  describe('findAll', () => {
    it('should return paginated blog posts', async () => {
      const blog1 = new Blog();
      blog1.title = 'Test Blog 1';
      blog1.content = 'Test Content 1';
      blog1.image_urls = ['http://example.com/image.jpg'];
      blog1.tags = ['test'];
      blog1.author = new User();
      blog1.created_at = new Date('2023-01-01');
      blog1.updated_at = new Date();

      const blog2 = new Blog();
      blog2.title = 'Test Blog 2';
      blog2.content = 'Test Content 2';
      blog2.author = new User();
      blog2.tags = ['test'];
      blog2.image_urls = ['http://example.com/image.jpg'];
      blog2.created_at = new Date('2023-01-02');
      blog2.updated_at = new Date();

      jest.spyOn(blogRepository, 'findAndCount').mockResolvedValue([[blog2, blog1], 2]);

      const result = await service.findAll(1, 10);

      expect(result.status_code).toBe(200);
      expect(result.message).toBe('Blogs retrieved successfully');
      expect(result.data).toHaveLength(2);
      expect(result.data[0].title).toBe('Test Blog 2');
      expect(result.data[1].title).toBe('Test Blog 1');
      expect(result.next).toBe('http://example.com/api/v1/blogs?page=2&page_size=10');
      expect(result.previous).toBe(null);
    });

    it('should return an empty list if no blog posts are present', async () => {
      jest.spyOn(blogRepository, 'findAndCount').mockResolvedValue([[], 0]);

      const result = await service.findAll(1, 10);

      expect(result.status_code).toBe(200);
      expect(result.message).toBe('Blogs retrieved successfully');
      expect(result.data).toHaveLength(0);
      expect(result.next).toBe('http://example.com/api/v1/blogs?page=2&page_size=10');
      expect(result.previous).toBe(null);
    });

    it('should throw BadRequestException for invalid page parameters', async () => {
      await expect(service.findAll(-1, 10)).rejects.toThrow(BadRequestException);
      await expect(service.findAll(1, -10)).rejects.toThrow(BadRequestException);
    });
  });
});
