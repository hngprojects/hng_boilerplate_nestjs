import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BlogCategory } from '../entities/blog-category.entity';
import { CreateBlogCategoryDto } from '../dto/create-blog-category.dto';
import { BlogCategoryService } from '../blog-category.service';

describe('BlogCategoryService', () => {
  let service: BlogCategoryService;
  let repository: Repository<BlogCategory>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        BlogCategoryService,
        {
          provide: getRepositoryToken(BlogCategory),
          useClass: Repository,
        },
      ],
    }).compile();

    service = module.get<BlogCategoryService>(BlogCategoryService);
    repository = module.get<Repository<BlogCategory>>(getRepositoryToken(BlogCategory));
  });

  it('should create a blog category successfully', async () => {
    const createBlogCategoryDto: CreateBlogCategoryDto = {
      name: 'Tech',
    };

    const blogCategory: BlogCategory = {
      id: '1',
      name: 'Tech',
    } as any;

    jest.spyOn(repository, 'create').mockReturnValue(blogCategory);
    jest.spyOn(repository, 'save').mockResolvedValue(blogCategory);

    const result = await service.createOrganisationCategory(createBlogCategoryDto);

    expect(repository.create).toHaveBeenCalledWith(createBlogCategoryDto);
    expect(repository.save).toHaveBeenCalledWith(blogCategory);
    expect(result).toEqual({
      data: blogCategory,
      message: 'Blog category created successfully.',
    });
  });

  it('should throw an error if repository save fails', async () => {
    const createBlogCategoryDto: CreateBlogCategoryDto = {
      name: 'Tech',
    };

    jest.spyOn(repository, 'create').mockReturnValue({} as BlogCategory);
    jest.spyOn(repository, 'save').mockRejectedValue(new Error('Save failed'));

    await expect(service.createOrganisationCategory(createBlogCategoryDto)).rejects.toThrow('Save failed');
  });
});
