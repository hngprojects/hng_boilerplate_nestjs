import { Test, TestingModule } from '@nestjs/testing';
import { BlogService } from '../blog.service';
import UserService from '../../user/user.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Blog } from '../entities/blog.entity';
import { User, UserType } from '../../user/entities/user.entity';
import { Category } from '../../category/entities/category.entity';
import { CreateBlogPost } from '../dto/create-blog.dto';
import { NotFoundException, UnauthorizedException } from '@nestjs/common';
import { Profile } from '../../profile/entities/profile.entity';

describe('BlogService', () => {
  let service: BlogService;
  let blogRepository: Repository<Blog>;
  let userRepository: Repository<User>;
  let categoryRepository: Repository<Category>;
  let profileRepository: Repository<Profile>;
  let userService: UserService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        BlogService,
        UserService,
        {
          provide: getRepositoryToken(Blog),
          useClass: Repository,
        },
        {
          provide: getRepositoryToken(User),
          useClass: Repository,
        },
        {
          provide: getRepositoryToken(Category),
          useClass: Repository,
        },
      ],
    }).compile();

    service = module.get<BlogService>(BlogService);
    blogRepository = module.get<Repository<Blog>>(getRepositoryToken(Blog));
    userRepository = module.get<Repository<User>>(getRepositoryToken(User));
    categoryRepository = module.get<Repository<Category>>(getRepositoryToken(Category));
    profileRepository = module.get<Repository<Profile>>(getRepositoryToken(Profile));
    userService = module.get<UserService>(UserService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('createBlogPost', () => {
    it('should create a blog post if the user is a super user', async () => {
      const createBlogPost: CreateBlogPost = {
        title: 'Test Blog Post',
        content: 'This is a test blog post',
        author: 'super-user-id',
        category_id: 'category-id',
        image_url: [],
        user: new User(),
      };

      const user = new User();
      user.id = 'super-user-id';
      user.user_type = UserType.SUPER_ADMIN;

      jest.spyOn(userRepository, 'findOne').mockResolvedValue(user);
      jest.spyOn(categoryRepository, 'findOne').mockResolvedValue(new Category());
      jest.spyOn(blogRepository, 'create').mockReturnValue(new Blog());
      jest.spyOn(blogRepository, 'save').mockResolvedValue(new Blog());

      const result = await service.create(createBlogPost, 'super-user-id');

      expect(result).toBeInstanceOf(Blog);
      expect(result.title).toBe(createBlogPost.title);
      expect(result.content).toBe(createBlogPost.content);
    });

    it('should throw NotFoundException if the user is not found', async () => {
      const createBlogPost: CreateBlogPost = {
        title: 'Test Blog Post',
        content: 'This is a test blog post',
        author: 'non-existent-user-id',
        category_id: 'category-id',
        image_url: [],
        user: new User(),
      };

      jest.spyOn(userRepository, 'findOne').mockResolvedValue(null);

      await expect(service.create(createBlogPost, 'non-existent-user-id')).rejects.toThrow(NotFoundException);
    });

    it('should throw UnauthorizedException if the user is not a super user', async () => {
      const createBlogPost: CreateBlogPost = {
        title: 'Test Blog Post',
        content: 'This is a test blog post',
        author: 'regular-user-id',
        category_id: 'category-id',
        image_url: [],
        user: new User(),
      };

      const user = new User();
      user.id = 'regular-user-id';
      user.user_type = UserType.USER;

      jest.spyOn(userRepository, 'findOne').mockResolvedValue(user);

      await expect(service.create(createBlogPost, 'regular-user-id')).rejects.toThrow(UnauthorizedException);
    });

    it('should throw NotFoundException if the category is not found', async () => {
      const createBlogPost: CreateBlogPost = {
        title: 'Test Blog Post',
        content: 'This is a test blog post',
        author: 'super-user-id',
        category_id: 'non-existent-category-id',
        image_url: [],
        user: new User(),
      };

      const user = new User();
      user.id = 'super-user-id';
      user.user_type = UserType.SUPER_ADMIN;

      jest.spyOn(userRepository, 'findOne').mockResolvedValue(user);
      jest.spyOn(categoryRepository, 'findOne').mockResolvedValue(null);

      await expect(service.create(createBlogPost, 'super-user-id')).rejects.toThrow(NotFoundException);
    });
  });
});
