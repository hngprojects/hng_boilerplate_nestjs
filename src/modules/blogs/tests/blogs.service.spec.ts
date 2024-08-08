import * as SYS_MSG from '../../../helpers/SystemMessages';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BlogService } from '../blogs.service';
import { Blog } from '../entities/blog.entity';
import { User } from '../../user/entities/user.entity';

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
    findOneBy: jest.fn(),
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
        status: 200,
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

      await expect(service.getSingleBlog(blogId, user)).rejects.toThrowError(SYS_MSG.BLOG_NOT_FOUND);
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
});
