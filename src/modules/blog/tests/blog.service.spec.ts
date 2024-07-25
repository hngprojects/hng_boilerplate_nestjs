import { Test, TestingModule } from '@nestjs/testing';
import { BlogService } from '../services/blog.service';
import { Blog } from '../entities/blog.entity';
import { User } from '../../user/entities/user.entity';
import { BlogCategory } from '../entities/blog-category.entity';
import { Repository } from 'typeorm';
import { getRepositoryToken } from '@nestjs/typeorm';
import { NotFoundException, HttpStatus } from '@nestjs/common';

describe('BlogService', () => {
  let service: BlogService;
  let blogRepository: Partial<jest.Mocked<Repository<Blog>>>;
  let userRepository: Partial<jest.Mocked<Repository<User>>>;
  let categoryRepository: Partial<jest.Mocked<Repository<BlogCategory>>>;

  beforeEach(async () => {
    blogRepository = {
      create: jest.fn(),
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
          image_url: 'https://example.com/img.jpg',
          content: 'Test blog content',
        })
      ).rejects.toThrow(new NotFoundException('User not found'));
    });

    it('should throw NotFoundException if category is not found', async () => {
      userRepository.findOne.mockResolvedValue({ id: 'useruid' } as User);
      categoryRepository.findOne.mockResolvedValue(null);

      await expect(
        service.create({
          authorId: 'authoruid',
          categoryId: 'categoryuid',
          title: 'Test Blog',
          image_url: 'https://example.com/img.jpg',
          content: 'Test blog content',
        })
      ).rejects.toThrow(new NotFoundException('Category not found'));
    });

    it('should create and save a blog', async () => {
      const createBlogDto = {
        authorId: 'authoruid',
        categoryId: 'categoryuid',
        title: 'Test Blog',
        image_url: 'https://example.com/img.jpg',
        content: 'Test blog content',
      };

      const author: User = {
        id: 'authoruid',
        first_name: 'John',
        last_name: 'Doe',
        email: 'john@example.com',
        user_type: 'admin',
        is_active: true,
        attempts_left: 3,
        time_left: 0,
        owned_organisations: [],
        created_organisations: [],
        created_at: new Date(),
        updated_at: new Date(),
      } as User;

      const category: BlogCategory = {
        id: 'categoryuid',
        name: 'Test Category',
      } as BlogCategory;

      const savedBlog: Blog = {
        id: 'blogid',
        ...createBlogDto,
        author,
        category,
        isPublished: false,
      } as unknown as Blog;

      userRepository.findOne.mockResolvedValue(author);
      categoryRepository.findOne.mockResolvedValue(category);
      blogRepository.create.mockReturnValue(savedBlog);
      blogRepository.save.mockResolvedValue(savedBlog);

      const result = await service.create(createBlogDto);

      expect(result).toEqual({
        status: 'success',
        message: 'Blog created successfully',
        status_code: HttpStatus.CREATED,
        data: {
          id: savedBlog.id,
          title: savedBlog.title,
          image_url: savedBlog.image_url,
          content: savedBlog.content,
          isPublished: savedBlog.isPublished,
          author: {
            id: author.id,
            first_name: author.first_name,
            last_name: author.last_name,
            email: author.email,
            user_type: author.user_type,
            is_active: author.is_active,
            attempts_left: author.attempts_left,
            time_left: author.time_left,
            owned_organisations: author.owned_organisations,
            created_organisations: author.created_organisations,
            created_at: author.created_at,
            updated_at: author.updated_at,
          },
          category: {
            id: category.id,
            name: category.name,
          },
          comments: [],
        },
      });

      expect(blogRepository.create).toHaveBeenCalledWith({
        title: createBlogDto.title,
        content: createBlogDto.content,
        image_url: createBlogDto.image_url,
        author,
        category,
      });
      expect(blogRepository.save).toHaveBeenCalledWith(savedBlog);
    });
  });
});
