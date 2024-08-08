import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BlogCategory } from '../entities/blog-category.entity';
import { CreateBlogCategoryDto } from '../dto/create-blog-category.dto';
import { BlogCategoryService } from '../blog-category.service';
import { CustomHttpException } from '../../../helpers/custom-http-filter';

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

  it('should update an organisation category successfully', async () => {
    const category = { id: '1', name: 'Tech' } as any;
    const updatedCategory = { id: '1', name: 'Technology' } as any;

    jest.spyOn(repository, 'findOne').mockResolvedValue(category);
    jest.spyOn(repository, 'save').mockResolvedValue(updatedCategory);

    const result = await service.updateOrganisationCategory('1', { name: 'Technology' });
    expect(result).toEqual({ data: updatedCategory, message: 'Organisation category updated successfully.' });
  });

  it('should throw NotFoundException if category does not exist', async () => {
    jest.spyOn(repository, 'findOne').mockResolvedValue(null);

    await expect(service.updateOrganisationCategory('1', { name: 'Technology' })).rejects.toThrow(CustomHttpException);
  });
});
