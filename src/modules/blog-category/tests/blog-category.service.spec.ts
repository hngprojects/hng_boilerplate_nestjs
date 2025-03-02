import 'module-alias/register';
import 'reflect-metadata';
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

  it('should successfully delete a blog category', async () => {
    const blogCategory = new BlogCategory();
    blogCategory.id = 'blog-id';

    jest.spyOn(repository, 'findOne').mockResolvedValue(blogCategory);
    jest.spyOn(repository, 'remove').mockResolvedValue(undefined);

    await service.deleteOrganisationCategory('blog-id');

    expect(repository.findOne).toHaveBeenCalledWith({ where: { id: 'blog-id' } });
    expect(repository.remove).toHaveBeenCalledWith(blogCategory);
  });

  it('should return empty array and total 0 for empty search term', async () => {
    const result = await service.searchCategories('');
    expect(result).toEqual({
      status: 'success',
      status_code: 200,
      message: 'No search term provided',
      data: { categories: [], total: 0 },
    });
  });

  it('should return matching categories for partial search term', async () => {
    const mockCategories = [
      { id: '1', name: 'Technology' },
      { id: '2', name: 'Tech News' },
    ];

    jest.spyOn(repository, 'createQueryBuilder').mockReturnValue({
      where: jest.fn().mockReturnThis(),
      getMany: jest.fn().mockResolvedValue(mockCategories),
    } as any);

    const result = await service.searchCategories('tech');
    expect(result).toEqual({
      status: 'success',
      status_code: 200,
      message: 'Categories found successfully',
      data: { categories: mockCategories, total: 2 },
    });
  });

  it('should return empty array and total 0 for no matches', async () => {
    jest.spyOn(repository, 'createQueryBuilder').mockReturnValue({
      where: jest.fn().mockReturnThis(),
      getMany: jest.fn().mockResolvedValue([]),
    } as any);

    const result = await service.searchCategories('nonexistent');
    expect(result).toEqual({
      status: 'success',
      status_code: 200,
      message: 'No categories found',
      data: { categories: [], total: 0 },
    });
  });

  it('should handle search term with special characters', async () => {
    const mockCategories = [{ id: '1', name: 'C# Programming' }];

    jest.spyOn(repository, 'createQueryBuilder').mockReturnValue({
      where: jest.fn().mockReturnThis(),
      getMany: jest.fn().mockResolvedValue(mockCategories),
    } as any);

    const result = await service.searchCategories('C#');
    expect(result).toEqual({
      status: 'success',
      status_code: 200,
      message: 'Categories found successfully',
      data: { categories: mockCategories, total: 1 },
    });
  });
});
