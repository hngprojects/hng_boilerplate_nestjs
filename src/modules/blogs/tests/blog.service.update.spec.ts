import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BlogService } from '../blogs.service';
import { Blog } from '../entities/blog.entity';
import { User } from '../../user/entities/user.entity';
import { NotFoundException } from '@nestjs/common';

describe('BlogService', () => {
  let service: BlogService;
  let blogRepository: Repository<Blog>;
  let userRepository: Repository<User>;

  const mockUserRepository = () => ({
    findOne: jest.fn(),
  });

  const mockBlogRepository = () => ({
    findOne: jest.fn(),
    save: jest.fn(),
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

  describe('updateBlog', () => {
    it('should successfully update a blog', async () => {
      const updateBlogDto = {
        title: 'Updated Blog',
        content: 'Updated Content',
        tags: ['updated'],
        image_urls: ['http://example.com/updated.jpg'],
      };

      const user = new User();
      user.id = 'user-id';
      user.first_name = 'John';
      user.last_name = 'Doe';

      const fullUser = { first_name: 'John', last_name: 'Doe' };

      const blog = new Blog();
      blog.id = 'blog-id';
      blog.title = 'Old Title';
      blog.content = 'Old Content';
      blog.tags = ['old'];
      blog.image_urls = ['http://example.com/old.jpg'];
      blog.author = fullUser as unknown as User;
      blog.created_at = new Date();
      blog.updated_at = new Date();

      const updatedBlog = {
        ...blog,
        ...updateBlogDto,
        author: fullUser,
      };

      const expectedResponse = {
        blog_id: 'blog-id',
        title: 'Updated Blog',
        content: 'Updated Content',
        tags: ['updated'],
        image_urls: ['http://example.com/updated.jpg'],
        author: 'John Doe',
        created_at: blog.created_at,
      };

      jest.spyOn(blogRepository, 'findOne').mockResolvedValue(blog);
      jest.spyOn(userRepository, 'findOne').mockResolvedValue(fullUser as unknown as User);
      jest.spyOn(blogRepository, 'save').mockResolvedValue(updatedBlog as Blog);

      const result = await service.updateBlog('blog-id', updateBlogDto, user);

      expect(result).toEqual(expectedResponse);
      expect(blogRepository.findOne).toHaveBeenCalledWith({
        where: { id: 'blog-id' },
        relations: ['author'],
      });
      expect(userRepository.findOne).toHaveBeenCalledWith({
        where: { id: user.id },
        select: ['first_name', 'last_name'],
      });
      expect(blogRepository.save).toHaveBeenCalledWith({
        ...blog,
        ...updateBlogDto,
        author: fullUser,
      });
    });

    it('should throw an error if blog not found', async () => {
      const updateBlogDto = {
        title: 'Updated Blog',
        content: 'Updated Content',
        tags: ['updated'],
        image_urls: ['http://example.com/updated.jpg'],
      };

      const user = new User();
      user.id = 'user-id';

      jest.spyOn(blogRepository, 'findOne').mockResolvedValue(null);

      await expect(service.updateBlog('blog-id', updateBlogDto, user)).rejects.toThrowError(NotFoundException);
    });

    it('should throw an error if user not found', async () => {
      const updateBlogDto = {
        title: 'Updated Blog',
        content: 'Updated Content',
        tags: ['updated'],
        image_urls: ['http://example.com/updated.jpg'],
      };

      const user = new User();
      user.id = 'user-id';

      const blog = new Blog();
      blog.id = 'blog-id';
      blog.title = 'Old Title';
      blog.content = 'Old Content';
      blog.tags = ['old'];
      blog.image_urls = ['http://example.com/old.jpg'];
      blog.author = { first_name: 'John', last_name: 'Doe' } as unknown as User;
      blog.created_at = new Date();
      blog.updated_at = new Date();

      jest.spyOn(blogRepository, 'findOne').mockResolvedValue(blog);
      jest.spyOn(userRepository, 'findOne').mockResolvedValue(null);

      await expect(service.updateBlog('blog-id', updateBlogDto, user)).rejects.toThrowError(NotFoundException);
    });
  });
});
