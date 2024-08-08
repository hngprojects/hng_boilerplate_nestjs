import * as SYS_MSG from '../../../helpers/SystemMessages';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository, Like, MoreThanOrEqual } from 'typeorm';
import { BlogService } from '../blogs.service';
import { Blog } from '../entities/blog.entity';
import { User } from '../../user/entities/user.entity';
import { CustomHttpException } from '../../../helpers/custom-http-filter';

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
    findOneBy: jest.fn(),
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

      await expect(service.createBlog(createBlogDto, user)).rejects.toThrow('User not found');
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

      const expectedResponse = {
        status_code: 200,
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
              created_at: new Date('2023-01-01'),
            },
          ],
          meta: {
            has_next: false,
            total: 1,
            next_page: null,
            prev_page: null,
          },
        },
      };

      jest.spyOn(blogRepository, 'findAndCount').mockResolvedValue([[blog], 1]);

      const result = await service.searchBlogs(query);

      expect(result).toEqual(expectedResponse);
      expect(blogRepository.findAndCount).toHaveBeenCalledWith({
        where: {
          author: {
            first_name: Like('%John%'),
            last_name: Like('%John%'),
          },
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

      const expectedResponse = {
        status_code: 404,
        message: 'no_results_found_for_the_provided_search_criteria',
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
      };

      jest.spyOn(blogRepository, 'findAndCount').mockResolvedValue([[], 0]);

      const result = await service.searchBlogs(query);

      expect(result).toEqual(expectedResponse);
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

  describe('getSingleBlog', () => {
    it('should successfully retrieve a blog', async () => {
      const user = new User();
      user.id = 'user-id';
      user.first_name = 'John';
      user.last_name = 'Doe';

      const blogId = 'blog-id';
      const blog = new Blog();
      blog.id = 'blog-id';
      blog.title = 'Test Blog';
      blog.content = 'Test Content';
      blog.tags = ['test'];
      blog.image_urls = ['http://example.com/image.jpg'];
      blog.created_at = new Date();
      blog.updated_at = new Date();

      jest.spyOn(blogRepository, 'findOneBy').mockResolvedValue(blog);
      jest.spyOn(userRepository, 'findOne').mockResolvedValue(user);

      const result = await service.getSingleBlog(blogId, user);

      expect(result).toEqual({
        status_code: 200,
        message: SYS_MSG.BLOG_FETCHED_SUCCESSFUL,
        data: {
          blog_id: blog.id,
          title: blog.title,
          content: blog.content,
          tags: blog.tags,
          image_urls: blog.image_urls,
          published_date: blog.created_at,
          author: 'John Doe',
        },
      });
      expect(blogRepository.findOneBy).toHaveBeenCalledWith({ id: blogId });
      expect(userRepository.findOne).toHaveBeenCalledWith({
        where: { id: user.id },
        select: ['first_name', 'last_name'],
      });
    });

    it('should throw an error if blog not found', async () => {
      const blogId = 'non-existent-blog-id';
      const user = new User();
      user.id = 'user-id-is-here';
      user.first_name = 'John';
      user.last_name = 'Doe';

      jest.spyOn(userRepository, 'findOne').mockResolvedValue(user);
      jest.spyOn(blogRepository, 'findOneBy').mockResolvedValue(null);

      await expect(service.getSingleBlog(blogId, user)).rejects.toThrow(SYS_MSG.BLOG_NOT_FOUND);
    });
  });

  describe('deleteBlogPost', () => {
    it('should successfully delete a blog post', async () => {
      const blog = new Blog();
      blog.id = 'blog-id';

      jest.spyOn(blogRepository, 'findOne').mockResolvedValue(blog);
      jest.spyOn(blogRepository, 'remove').mockResolvedValue(undefined);

      await service.deleteBlogPost('blog-id');

      expect(blogRepository.findOne).toHaveBeenCalledWith({ where: { id: 'blog-id' } });
      expect(blogRepository.remove).toHaveBeenCalledWith(blog);
    });

    it('should throw a 404 error if blog not found', async () => {
      jest.spyOn(blogRepository, 'findOne').mockResolvedValue(null);

      await expect(service.deleteBlogPost('blog-id')).rejects.toThrow('Blog post with this id does not exist');
    });
  });

  describe('findAllBlogs', () => {
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

      const result = await service.getAllBlogs(1, 10);

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

      const result = await service.getAllBlogs(1, 10);

      expect(result.status_code).toBe(200);
      expect(result.message).toBe('Blogs retrieved successfully');
      expect(result.data).toHaveLength(0);
      expect(result.next).toBe('http://example.com/api/v1/blogs?page=2&page_size=10');
      expect(result.previous).toBe(null);
    });

    it('should throw BadRequestException for invalid page parameters', async () => {
      await expect(service.getAllBlogs(-1, 10)).rejects.toThrow(CustomHttpException);
      await expect(service.getAllBlogs(1, -10)).rejects.toThrow(CustomHttpException);
    });
  });
});
