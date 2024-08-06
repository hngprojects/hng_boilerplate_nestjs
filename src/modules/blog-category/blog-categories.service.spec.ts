import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BlogCategoriesService } from './blog-categories.service';
import { BlogCategory } from './entities/blog-category.entity';
import { CreateBlogCategoryDto } from './dto/create-blog-category.dto';

describe('BlogCategoriesService', () => {
  let service: BlogCategoriesService;
  let repository: Repository<BlogCategory>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        BlogCategoriesService,
        {
          provide: getRepositoryToken(BlogCategory),
          useClass: Repository,
        },
      ],
    }).compile();

    service = module.get<BlogCategoriesService>(BlogCategoriesService);
    repository = module.get<Repository<BlogCategory>>(getRepositoryToken(BlogCategory));
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a new blog category', async () => {
      const createBlogCategoryDto: CreateBlogCategoryDto = { name: 'Tech' };
      const blogCategory: BlogCategory = { id: '1', name: 'Tech', created_at: new Date(), updated_at: new Date() };

      jest.spyOn(repository, 'create').mockReturnValue(blogCategory);
      jest.spyOn(repository, 'save').mockResolvedValue(blogCategory);

      const result = await service.create(createBlogCategoryDto);
      expect(result).toEqual(blogCategory);
      expect(repository.create).toHaveBeenCalledWith(createBlogCategoryDto);
      expect(repository.save).toHaveBeenCalledWith(blogCategory);
    });
  });
});
