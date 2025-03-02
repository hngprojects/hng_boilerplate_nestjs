import 'module-alias/register';
import 'reflect-metadata';
import * as SYS_MSG from '@shared/constants/SystemMessages';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository, Like, MoreThanOrEqual, Not, IsNull } from 'typeorm';
import { Blog } from '../entities/blog.entity';
import { User } from '@modules/user/entities/user.entity';
import { BlogService } from '../blogs.service';

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
    findOne: jest.fn(),
    remove: jest.fn(),
    softRemove: jest.fn(),
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
      blog.updated_at = new Date();

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
              deletedAt: undefined,
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
      blog.deletedAt = null;

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
          created_at: blog.created_at,
          deletedAt: blog.deletedAt,
        },
      });
      expect(blogRepository.findOneBy).toHaveBeenCalledWith({ id: blogId, deletedAt: null });
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
      jest.spyOn(blogRepository, 'softRemove').mockResolvedValue(undefined);

      await service.deleteBlogPost('blog-id');

      expect(blogRepository.findOne).toHaveBeenCalledWith({ where: { id: 'blog-id' } });
      expect(blogRepository.softRemove).toHaveBeenCalledWith(blog);
    });

    it('should throw a 404 error if blog not found', async () => {
      jest.spyOn(blogRepository, 'findOne').mockResolvedValue(null);

      await expect(service.deleteBlogPost('blog-id')).rejects.toThrow('Blog post with this id does not exist');
    });
  });

  describe('getAllBlogs', () => {
    it('should return all blogs excluding deleted', async () => {
      const blog = new Blog();
      blog.id = 'blog-id';
      blog.title = 'Test Blog';
      blog.content = 'Test Content';
      blog.tags = ['test'];
      blog.image_urls = ['http://example.com/image.jpg'];
      blog.author = new User();
      blog.author.first_name = 'John';
      blog.author.last_name = 'Doe';
      blog.created_at = new Date();
      blog.updated_at = new Date();

      const expectedResponse = {
        status_code: 200,
        message: SYS_MSG.BLOG_FETCHED_SUCCESSFUL,
        data: {
          currentPage: 1,
          totalPages: 1,
          totalResults: 1,
          blogs: [
            {
              blog_id: 'blog-id',
              title: 'Test Blog',
              content: 'Test Content',
              tags: ['test'],
              image_urls: ['http://example.com/image.jpg'],
              author: 'John Doe',
              created_at: blog.created_at,
              deletedAt: undefined,
            },
          ],
          meta: {
            hasNext: false,
            total: 1,
            nextPage: null,
            prevPage: null,
          },
        },
      };

      jest.spyOn(blogRepository, 'findAndCount').mockResolvedValue([[blog], 1]);

      const result = await service.getAllBlogs(1, 10);

      expect(result).toEqual(expectedResponse);
      expect(blogRepository.findAndCount).toHaveBeenCalledWith({
        where: { deletedAt: null },
        skip: 0,
        take: 10,
        relations: ['author'],
      });
    });

    it('should return all blogs including deleted', async () => {
      const blog = new Blog();
      blog.id = 'blog-id';
      blog.title = 'Test Blog';
      blog.content = 'Test Content';
      blog.tags = ['test'];
      blog.image_urls = ['http://example.com/image.jpg'];
      blog.author = new User();
      blog.author.first_name = 'John';
      blog.author.last_name = 'Doe';
      blog.created_at = new Date();
      blog.updated_at = new Date();
      blog.deletedAt = new Date();

      const expectedResponse = {
        status_code: 200,
        message: SYS_MSG.BLOG_FETCHED_SUCCESSFUL,
        data: {
          currentPage: 1,
          totalPages: 1,
          totalResults: 1,
          blogs: [
            {
              blog_id: 'blog-id',
              title: 'Test Blog',
              content: 'Test Content',
              tags: ['test'],
              image_urls: ['http://example.com/image.jpg'],
              author: 'John Doe',
              created_at: blog.created_at,
              deletedAt: blog.deletedAt,
            },
          ],
          meta: {
            hasNext: false,
            total: 1,
            nextPage: null,
            prevPage: null,
          },
        },
      };

      jest.spyOn(blogRepository, 'findAndCount').mockResolvedValue([[blog], 1]);

      const result = await service.getAllBlogs(1, 10, true);

      expect(result).toEqual(expectedResponse);
      expect(blogRepository.findAndCount).toHaveBeenCalledWith({
        where: {},
        skip: 0,
        take: 10,
        relations: ['author'],
      });
    });

    it('should return an empty list if no blogs are found', async () => {
      jest.spyOn(blogRepository, 'findAndCount').mockResolvedValue([[], 0]);

      const result = await service.getAllBlogs(1, 10);

      expect(result).toEqual({
        status_code: 200,
        message: SYS_MSG.BLOG_FETCHED_SUCCESSFUL,
        data: {
          currentPage: 1,
          totalPages: 0,
          totalResults: 0,
          blogs: [],
          meta: {
            hasNext: false,
            total: 0,
            nextPage: null,
            prevPage: null,
          },
        },
      });
      expect(blogRepository.findAndCount).toHaveBeenCalledWith({
        where: { deletedAt: null },
        skip: 0,
        take: 10,
        relations: ['author'],
      });
    });

    it('should handle pagination correctly', async () => {
      const blog = new Blog();
      blog.id = 'blog-id';
      blog.title = 'Test Blog';
      blog.content = 'Test Content';
      blog.tags = ['test'];
      blog.image_urls = ['http://example.com/image.jpg'];
      blog.author = new User();
      blog.author.first_name = 'John';
      blog.author.last_name = 'Doe';
      blog.created_at = new Date();
      blog.updated_at = new Date();

      jest.spyOn(blogRepository, 'findAndCount').mockResolvedValue([[blog], 1]);

      const result = await service.getAllBlogs(2, 1);

      expect(result).toEqual({
        status_code: 200,
        message: SYS_MSG.BLOG_FETCHED_SUCCESSFUL,
        data: {
          currentPage: 2,
          totalPages: 1,
          totalResults: 1,
          blogs: [
            {
              blog_id: 'blog-id',
              title: 'Test Blog',
              content: 'Test Content',
              tags: ['test'],
              image_urls: ['http://example.com/image.jpg'],
              author: 'John Doe',
              created_at: blog.created_at,
              deletedAt: undefined,
            },
          ],
          meta: {
            hasNext: false,
            total: 1,
            nextPage: null,
            prevPage: 1,
          },
        },
      });
      expect(blogRepository.findAndCount).toHaveBeenCalledWith({
        where: { deletedAt: null },
        skip: 1,
        take: 1,
        relations: ['author'],
      });
    });

    it('should return all blogs excluding deleted with multiple mock data', async () => {
      const blog1 = new Blog();
      blog1.id = 'blog-id-1';
      blog1.title = 'Test Blog 1';
      blog1.content = 'Test Content 1';
      blog1.tags = ['test1'];
      blog1.image_urls = ['http://example.com/image1.jpg'];
      blog1.author = new User();
      blog1.author.first_name = 'John';
      blog1.author.last_name = 'Doe';
      blog1.created_at = new Date();
      blog1.updated_at = new Date();
      blog1.deletedAt = null;

      const blog2 = new Blog();
      blog2.id = 'blog-id-2';
      blog2.title = 'Test Blog 2';
      blog2.content = 'Test Content 2';
      blog2.tags = ['test2'];
      blog2.image_urls = ['http://example.com/image2.jpg'];
      blog2.author = new User();
      blog2.author.first_name = 'Jane';
      blog2.author.last_name = 'Doe';
      blog2.created_at = new Date();
      blog2.updated_at = new Date();
      blog2.deletedAt = new Date();

      jest.spyOn(blogRepository, 'findAndCount').mockResolvedValue([[blog1, blog2], 2]);

      const result = await service.getAllBlogs(1, 10);

      expect(result).toEqual({
        status_code: 200,
        message: SYS_MSG.BLOG_FETCHED_SUCCESSFUL,
        data: {
          currentPage: 1,
          totalPages: 1,
          totalResults: 2,
          blogs: [
            {
              blog_id: 'blog-id-1',
              title: 'Test Blog 1',
              content: 'Test Content 1',
              tags: ['test1'],
              image_urls: ['http://example.com/image1.jpg'],
              author: 'John Doe',
              created_at: blog1.created_at,
            },
          ],
          meta: {
            hasNext: false,
            total: 2,
            nextPage: null,
            prevPage: null,
          },
        },
      });
      expect(blogRepository.findAndCount).toHaveBeenCalledWith({
        where: { deletedAt: null },
        skip: 0,
        take: 10,
        relations: ['author'],
      });
    });

    it('should return all blogs including deleted with multiple mock data', async () => {
      const blog1 = new Blog();
      blog1.id = 'blog-id-1';
      blog1.title = 'Test Blog 1';
      blog1.content = 'Test Content 1';
      blog1.tags = ['test1'];
      blog1.image_urls = ['http://example.com/image1.jpg'];
      blog1.author = new User();
      blog1.author.first_name = 'John';
      blog1.author.last_name = 'Doe';
      blog1.created_at = new Date();
      blog1.updated_at = new Date();
      blog1.deletedAt = null;

      const blog2 = new Blog();
      blog2.id = 'blog-id-2';
      blog2.title = 'Test Blog 2';
      blog2.content = 'Test Content 2';
      blog2.tags = ['test2'];
      blog2.image_urls = ['http://example.com/image2.jpg'];
      blog2.author = new User();
      blog2.author.first_name = 'Jane';
      blog2.author.last_name = 'Doe';
      blog2.created_at = new Date();
      blog2.updated_at = new Date();
      blog2.deletedAt = new Date();

      jest.spyOn(blogRepository, 'findAndCount').mockResolvedValue([[blog1, blog2], 2]);

      const result = await service.getAllBlogs(1, 10, true);

      expect(result).toEqual({
        status_code: 200,
        message: SYS_MSG.BLOG_FETCHED_SUCCESSFUL,
        data: {
          currentPage: 1,
          totalPages: 1,
          totalResults: 2,
          blogs: [
            {
              blog_id: 'blog-id-1',
              title: 'Test Blog 1',
              content: 'Test Content 1',
              tags: ['test1'],
              image_urls: ['http://example.com/image1.jpg'],
              author: 'John Doe',
              created_at: blog1.created_at,
              deletedAt: null,
            },
            {
              blog_id: 'blog-id-2',
              title: 'Test Blog 2',
              content: 'Test Content 2',
              tags: ['test2'],
              image_urls: ['http://example.com/image2.jpg'],
              author: 'Jane Doe',
              created_at: blog2.created_at,
              deletedAt: blog2.deletedAt,
            },
          ],
          meta: {
            hasNext: false,
            total: 2,
            nextPage: null,
            prevPage: null,
          },
        },
      });
      expect(blogRepository.findAndCount).toHaveBeenCalledWith({
        where: {},
        skip: 0,
        take: 10,
        relations: ['author'],
      });
    });
  });

  describe('getDeletedBlogs', () => {
    it('should return all deleted blogs', async () => {
      const blog = new Blog();
      blog.id = 'blog-id';
      blog.title = 'Test Blog';
      blog.content = 'Test Content';
      blog.tags = ['test'];
      blog.image_urls = ['http://example.com/image.jpg'];
      blog.author = new User();
      blog.author.first_name = 'John';
      blog.author.last_name = 'Doe';
      blog.created_at = new Date();
      blog.updated_at = new Date();
      blog.deletedAt = new Date();

      const expectedResponse = {
        status_code: 200,
        message: SYS_MSG.BLOG_FETCHED_SUCCESSFUL,
        data: {
          currentPage: 1,
          totalPages: 1,
          totalResults: 1,
          blogs: [
            {
              blog_id: 'blog-id',
              title: 'Test Blog',
              content: 'Test Content',
              tags: ['test'],
              image_urls: ['http://example.com/image.jpg'],
              author: 'John Doe',
              created_at: blog.created_at,
              deletedAt: blog.deletedAt,
            },
          ],
          meta: {
            hasNext: false,
            total: 1,
            nextPage: null,
            prevPage: null,
          },
        },
      };

      jest.spyOn(blogRepository, 'findAndCount').mockResolvedValue([[blog], 1]);

      const result = await service.getDeletedBlogs(1, 10);

      expect(result).toEqual(expectedResponse);
      expect(blogRepository.findAndCount).toHaveBeenCalledWith({
        where: { deletedAt: Not(IsNull()) },
        skip: 0,
        take: 10,
        relations: ['author'],
      });
    });

    it('should return an empty list if no deleted blogs are found', async () => {
      jest.spyOn(blogRepository, 'findAndCount').mockResolvedValue([[], 0]);

      const result = await service.getDeletedBlogs(1, 10);

      expect(result).toEqual({
        status_code: 200,
        message: SYS_MSG.BLOG_FETCHED_SUCCESSFUL,
        data: {
          currentPage: 1,
          totalPages: 0,
          totalResults: 0,
          blogs: [],
          meta: {
            hasNext: false,
            total: 0,
            nextPage: null,
            prevPage: null,
          },
        },
      });
      expect(blogRepository.findAndCount).toHaveBeenCalledWith({
        where: { deletedAt: Not(IsNull()) },
        skip: 0,
        take: 10,
        relations: ['author'],
      });
    });

    it('should handle pagination correctly for deleted blogs', async () => {
      const blog = new Blog();
      blog.id = 'blog-id';
      blog.title = 'Test Blog';
      blog.content = 'Test Content';
      blog.tags = ['test'];
      blog.image_urls = ['http://example.com/image.jpg'];
      blog.author = new User();
      blog.author.first_name = 'John';
      blog.author.last_name = 'Doe';
      blog.created_at = new Date();
      blog.updated_at = new Date();
      blog.deletedAt = new Date();

      jest.spyOn(blogRepository, 'findAndCount').mockResolvedValue([[blog], 1]);

      const result = await service.getDeletedBlogs(2, 1);

      expect(result).toEqual({
        status_code: 200,
        message: SYS_MSG.BLOG_FETCHED_SUCCESSFUL,
        data: {
          currentPage: 2,
          totalPages: 1,
          totalResults: 1,
          blogs: [
            {
              blog_id: 'blog-id',
              title: 'Test Blog',
              content: 'Test Content',
              tags: ['test'],
              image_urls: ['http://example.com/image.jpg'],
              author: 'John Doe',
              created_at: blog.created_at,
              deletedAt: blog.deletedAt,
            },
          ],
          meta: {
            hasNext: false,
            total: 1,
            nextPage: null,
            prevPage: 1,
          },
        },
      });
      expect(blogRepository.findAndCount).toHaveBeenCalledWith({
        where: { deletedAt: Not(IsNull()) },
        skip: 1,
        take: 1,
        relations: ['author'],
      });
    });

    it('should return all deleted blogs with multiple mock data', async () => {
      const blog1 = new Blog();
      blog1.id = 'blog-id-1';
      blog1.title = 'Test Blog 1';
      blog1.content = 'Test Content 1';
      blog1.tags = ['test1'];
      blog1.image_urls = ['http://example.com/image1.jpg'];
      blog1.author = new User();
      blog1.author.first_name = 'John';
      blog1.author.last_name = 'Doe';
      blog1.created_at = new Date();
      blog1.updated_at = new Date();
      blog1.deletedAt = new Date();

      const blog2 = new Blog();
      blog2.id = 'blog-id-2';
      blog2.title = 'Test Blog 2';
      blog2.content = 'Test Content 2';
      blog2.tags = ['test2'];
      blog2.image_urls = ['http://example.com/image2.jpg'];
      blog2.author = new User();
      blog2.author.first_name = 'Jane';
      blog2.author.last_name = 'Doe';
      blog2.created_at = new Date();
      blog2.updated_at = new Date();
      blog2.deletedAt = new Date();

      jest.spyOn(blogRepository, 'findAndCount').mockResolvedValue([[blog1, blog2], 2]);

      const result = await service.getDeletedBlogs(1, 10);

      expect(result).toEqual({
        status_code: 200,
        message: SYS_MSG.BLOG_FETCHED_SUCCESSFUL,
        data: {
          currentPage: 1,
          totalPages: 1,
          totalResults: 2,
          blogs: [
            {
              blog_id: 'blog-id-1',
              title: 'Test Blog 1',
              content: 'Test Content 1',
              tags: ['test1'],
              image_urls: ['http://example.com/image1.jpg'],
              author: 'John Doe',
              created_at: blog1.created_at,
              deletedAt: blog1.deletedAt,
            },
            {
              blog_id: 'blog-id-2',
              title: 'Test Blog 2',
              content: 'Test Content 2',
              tags: ['test2'],
              image_urls: ['http://example.com/image2.jpg'],
              author: 'Jane Doe',
              created_at: blog2.created_at,
              deletedAt: blog2.deletedAt,
            },
          ],
          meta: {
            hasNext: false,
            total: 2,
            nextPage: null,
            prevPage: null,
          },
        },
      });
      expect(blogRepository.findAndCount).toHaveBeenCalledWith({
        where: { deletedAt: Not(IsNull()) },
        skip: 0,
        take: 10,
        relations: ['author'],
      });
    });
  });
});
