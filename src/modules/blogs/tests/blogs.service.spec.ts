import 'module-alias/register';
import 'reflect-metadata';
import * as SYS_MSG from '@shared/constants/SystemMessages';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository, Like, MoreThanOrEqual } from 'typeorm';
import { Blog } from '../entities/blog.entity';
import { User } from '@modules/user/entities/user.entity';
import { BlogService } from '../blogs.service';
import { CreateBlogDto } from '../dtos/create-blog.dto';
import { UpdateBlogDto } from '../dtos/update-blog.dto';
import { HttpStatus } from '@nestjs/common';
import { CustomHttpException } from '@shared/helpers/custom-http-filter';

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
    findOne: jest.fn(),
    remove: jest.fn(),
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

  describe('createBlog', () => {
    it('should successfully create a blog', async () => {
      const createBlogDto: CreateBlogDto = {
        title: 'Test Blog',
        content: 'Test Content',
        tags: ['test'],
        image_urls: ['http://example.com/image.jpg'],
      };

      const user = new User();
      user.id = 'user-id';
      user.first_name = 'John';
      user.last_name = 'Doe';

      const blog = new Blog();
      blog.id = 'blog-id';
      blog.title = 'Test Blog';
      blog.content = 'Test Content';
      blog.tags = ['test'];
      blog.image_urls = ['http://example.com/image.jpg'];
      blog.author = user;
      blog.created_at = new Date();

      jest.spyOn(userRepository, 'findOne').mockResolvedValue(user);
      jest.spyOn(blogRepository, 'create').mockReturnValue(blog);
      jest.spyOn(blogRepository, 'save').mockResolvedValue(blog);

      const result = await service.createBlog(createBlogDto, user);

      expect(result).toEqual({
        blog_id: 'blog-id',
        title: 'Test Blog',
        content: 'Test Content',
        tags: ['test'],
        image_urls: ['http://example.com/image.jpg'],
        author: 'John Doe',
        created_at: blog.created_at,
      });
      expect(userRepository.findOne).toHaveBeenCalledWith({
        where: { id: 'user-id' },
        select: ['first_name', 'last_name'],
      });
      expect(blogRepository.create).toHaveBeenCalledWith({
        ...createBlogDto,
        author: user,
      });
      expect(blogRepository.save).toHaveBeenCalledWith(blog);
    });

    it('should throw an error if user not found', async () => {
      const createBlogDto: CreateBlogDto = {
        title: 'Test Blog',
        content: 'Test Content',
        tags: ['test'],
        image_urls: ['http://example.com/image.jpg'],
      };

      const user = new User();
      user.id = 'user-id';

      jest.spyOn(userRepository, 'findOne').mockResolvedValue(null);

      await expect(service.createBlog(createBlogDto, user)).rejects.toThrow('User not found.');
    });
  });

  describe('getSingleBlog', () => {
    it('should successfully retrieve a blog', async () => {
      const user = new User();
      user.id = 'user-id';
      user.first_name = 'John';
      user.last_name = 'Doe';

      const blog = new Blog();
      blog.id = 'blog-id';
      blog.title = 'Test Blog';
      blog.content = 'Test Content';
      blog.tags = ['test'];
      blog.image_urls = ['http://example.com/image.jpg'];
      blog.author = user;
      blog.created_at = new Date();

      jest.spyOn(blogRepository, 'findOne').mockResolvedValue(blog);

      const result = await service.getSingleBlog('blog-id');

      expect(result).toEqual({
        status_code: HttpStatus.OK,
        message: SYS_MSG.BLOG_FETCHED_SUCCESSFUL,
        data: {
          blog_id: 'blog-id',
          title: 'Test Blog',
          content: 'Test Content',
          tags: ['test'],
          image_urls: ['http://example.com/image.jpg'],
          author: 'John Doe',
          created_at: blog.created_at,
        },
      });
      expect(blogRepository.findOne).toHaveBeenCalledWith({
        where: { id: 'blog-id' },
        relations: ['author'],
      });
    });

    it('should throw an error if blog not found', async () => {
      jest.spyOn(blogRepository, 'findOne').mockResolvedValue(null);

      await expect(service.getSingleBlog('non-existent-blog-id')).rejects.toThrow(SYS_MSG.BLOG_NOT_FOUND);
    });
  });

  describe('updateBlog', () => {
    it('should successfully update a blog', async () => {
      const updateBlogDto: UpdateBlogDto = {
        title: 'Updated Blog Title',
      };

      const user = new User();
      user.id = 'user-id';
      user.first_name = 'John';
      user.last_name = 'Doe';

      const blog = new Blog();
      blog.id = 'blog-id';
      blog.title = 'Test Blog';
      blog.content = 'Test Content';
      blog.tags = ['test'];
      blog.image_urls = ['http://example.com/image.jpg'];
      blog.author = user;
      blog.created_at = new Date();

      jest.spyOn(blogRepository, 'findOne').mockResolvedValue(blog);
      jest.spyOn(userRepository, 'findOne').mockResolvedValue(user);
      jest.spyOn(blogRepository, 'save').mockResolvedValue(blog);

      const result = await service.updateBlog('blog-id', updateBlogDto, user);

      expect(result).toEqual({
        blog_id: 'blog-id',
        title: 'Updated Blog Title',
        content: 'Test Content',
        tags: ['test'],
        image_urls: ['http://example.com/image.jpg'],
        author: 'John Doe',
        created_at: blog.created_at,
      });
      expect(blogRepository.findOne).toHaveBeenCalledWith({
        where: { id: 'blog-id' },
        relations: ['author'],
      });
      expect(blogRepository.save).toHaveBeenCalledWith(blog);
    });
  });

  describe('deleteBlogPost', () => {
    it('should successfully delete a blog post', async () => {
      const blog = new Blog();
      blog.id = 'blog-id';

      jest.spyOn(blogRepository, 'findOne').mockResolvedValue(blog);
      jest.spyOn(blogRepository, 'remove').mockResolvedValue(undefined);

      await service.deleteBlogPost('blog-id');

      expect(blogRepository.findOne).toHaveBeenCalledWith({
        where: { id: 'blog-id' },
        relations: [],
      });
      expect(blogRepository.remove).toHaveBeenCalledWith(blog);
    });

    it('should throw a 404 error if blog not found', async () => {
      jest.spyOn(blogRepository, 'findOne').mockResolvedValue(null);

      await expect(service.deleteBlogPost('non-existent-blog-id')).rejects.toThrow(SYS_MSG.BLOG_NOT_FOUND);
    });
  });

  describe('getAllBlogs', () => {
    it('should return paginated blog results', async () => {
      const user = new User();
      user.id = 'user-id';
      user.first_name = 'John';
      user.last_name = 'Doe';

      const blog = new Blog();
      blog.id = 'blog-id';
      blog.title = 'Test Blog';
      blog.content = 'Test Content';
      blog.tags = ['test'];
      blog.image_urls = ['http://example.com/image.jpg'];
      blog.author = user;
      blog.created_at = new Date();

      jest.spyOn(blogRepository, 'findAndCount').mockResolvedValue([[blog], 1]);

      const result = await service.getAllBlogs(1, 10);

      expect(result).toEqual({
        status_code: HttpStatus.OK,
        message: SYS_MSG.BLOG_FETCHED_SUCCESSFUL,
        data: {
          current_page: 1,
          total_pages: 1,
          total_results: 1,
          blogs: [
            {
              blog_id: 'blog-id',
              title: 'Test Blog',
              content: 'Test Content',
              tags: ['test'],
              image_urls: ['http://example.com/image.jpg'],
              author: 'John Doe',
              created_at: blog.created_at,
            },
          ],
          meta: {
            has_next: false,
            total: 1,
            next_page: null,
            prev_page: null,
          },
        },
      });
      expect(blogRepository.findAndCount).toHaveBeenCalledWith({
        skip: 0,
        take: 10,
        relations: ['author'],
      });
    });
  });

  describe('searchBlogs', () => {
    it('should return paginated blog results based on search criteria', async () => {
      const query = {
        author: 'John',
        title: 'Test',
        content: 'Content',
        tags: 'test',
        created_date: '2023-01-01',
        page: 1,
        page_size: 10,
      };

      const user = new User();
      user.id = 'user-id';
      user.first_name = 'John';
      user.last_name = 'Doe';

      const blog = new Blog();
      blog.id = 'blog-id';
      blog.title = 'Test Blog';
      blog.content = 'Test Content';
      blog.tags = ['test'];
      blog.image_urls = ['http://example.com/image.jpg'];
      blog.author = user;
      blog.created_at = new Date('2023-01-01');

      jest.spyOn(blogRepository, 'findAndCount').mockResolvedValue([[blog], 1]);

      const result = await service.searchBlogs(query);

      expect(result).toEqual({
        status_code: HttpStatus.OK,
        message: SYS_MSG.BLOG_FETCHED_SUCCESSFUL,
        data: {
          current_page: 1,
          total_pages: 1,
          total_results: 1,
          blogs: [
            {
              blog_id: 'blog-id',
              title: 'Test Blog',
              content: 'Test Content',
              tags: ['test'],
              image_urls: ['http://example.com/image.jpg'],
              author: 'John Doe',
              created_at: blog.created_at,
            },
          ],
          meta: {
            has_next: false,
            total: 1,
            next_page: null,
            prev_page: null,
          },
        },
      });
      expect(blogRepository.findAndCount).toHaveBeenCalledWith({
        where: {
          author: { first_name: Like('%John%'), last_name: Like('%John%') },
          title: Like('%Test%'),
          content: Like('%Content%'),
          tags: Like('%test%'),
          created_at: MoreThanOrEqual(new Date('2023-01-01')),
        },
        skip: 0,
        take: 10,
        relations: ['author'],
      });
    });

    it('should return an empty response if no results are found', async () => {
      const query = {
        author: 'NonExistentAuthor',
        page: 1,
        page_size: 10,
      };

      jest.spyOn(blogRepository, 'findAndCount').mockResolvedValue([[], 0]);

      const result = await service.searchBlogs(query);

      expect(result).toEqual({
        status_code: HttpStatus.NOT_FOUND,
        message: 'No results found.',
        data: {
          current_page: 1,
          total_pages: 0,
          total_results: 0,
          blogs: [],
          meta: {
            has_next: false,
            total: 0,
            next_page: null,
            prev_page: null,
          },
        },
      });
    });

    it('should validate empty query values and throw an error', async () => {
      const query = {
        author: '',
        page: 1,
        page_size: 10,
      };

      await expect(service.searchBlogs(query)).rejects.toThrow('author value is empty');
    });
  });
});
