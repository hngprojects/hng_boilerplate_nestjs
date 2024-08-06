import { Test, TestingModule } from '@nestjs/testing';
import { BlogsService } from '../blogs.service';
import { Repository } from 'typeorm';
import { Blog } from '../entities/blog.entity';
import { getRepositoryToken } from '@nestjs/typeorm';
import { BadRequestException, InternalServerErrorException } from '@nestjs/common';
import { User } from '../../user/entities/user.entity';

describe('BlogsService', () => {
  let service: BlogsService;
  let repository: Repository<Blog>;
  let userRepository: Repository<User>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        BlogsService,
        {
          provide: getRepositoryToken(Blog),
          useValue: {
            findAndCount: jest.fn(),
          },
        },
        {
          provide: getRepositoryToken(User),
          useValue: {
            findOne: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<BlogsService>(BlogsService);
    repository = module.get<Repository<Blog>>(getRepositoryToken(Blog));
    userRepository = module.get<Repository<User>>(getRepositoryToken(User));
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findAll', () => {
    it('should return paginated blog posts', async () => {
      const blog1 = new Blog();
      blog1.title = 'Test Blog 1';
      blog1.content = 'Test Content 1';
      blog1.created_at = new Date('2023-01-01');
      blog1.author = new User();

      const blog2 = new Blog();
      blog2.title = 'Test Blog 2';
      blog2.content = 'Test Content 2';
      blog2.created_at = new Date('2023-01-02');
      blog2.author = new User();

      jest.spyOn(repository, 'findAndCount').mockResolvedValue([[blog2, blog1], 2]);

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
      jest.spyOn(repository, 'findAndCount').mockResolvedValue([[], 0]);

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

    it('should handle internal server error', async () => {
      jest.spyOn(repository, 'findAndCount').mockRejectedValue(new InternalServerErrorException());

      await expect(service.findAll(1, 10)).rejects.toThrow(InternalServerErrorException);
    });
  });
});
