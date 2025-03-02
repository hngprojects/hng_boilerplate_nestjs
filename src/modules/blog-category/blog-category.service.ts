import { CustomHttpException } from '@shared/helpers/custom-http-filter';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { CreateBlogCategoryDto } from './dto/create-blog-category.dto';
import { CATEGORY_NOT_FOUND } from '@shared/constants/SystemMessages';
import { BlogCategory } from './entities/blog-category.entity';
import { Repository } from 'typeorm';

@Injectable()
export class BlogCategoryService {
  constructor(
    @InjectRepository(BlogCategory)
    private blogCategoryRepository: Repository<BlogCategory>
  ) { }

  async createOrganisationCategory(createBlogCategoryDto: CreateBlogCategoryDto) {
    const blogCategory = this.blogCategoryRepository.create(createBlogCategoryDto);
    await this.blogCategoryRepository.save(blogCategory);

    return { data: blogCategory, message: 'Blog category created successfully.' };
  }

  async updateOrganisationCategory(id: string, updateOrganisationCategoryDto: CreateBlogCategoryDto) {
    const category = await this.blogCategoryRepository.findOne({ where: { id } });
    if (!category) {
      throw new CustomHttpException(CATEGORY_NOT_FOUND, 404);
    }
    Object.assign(category, updateOrganisationCategoryDto);
    await this.blogCategoryRepository.save(category);
    return { data: category, message: 'Organisation category updated successfully.' };
  }

  async deleteOrganisationCategory(id: string) {
    const category = await this.blogCategoryRepository.findOne({ where: { id } });

    if (!category) {
      throw new CustomHttpException(CATEGORY_NOT_FOUND, 404);
    }

    await this.blogCategoryRepository.remove(category);

    return {
      message: 'Organisation category deleted successfully',
    };
  }

  async searchCategories(searchTerm: string): Promise<{
    status: string;
    status_code: number;
    message: string;
    data: { categories: BlogCategory[]; total: number };
  }> {
    // Handle empty search term
    if (!searchTerm || searchTerm.trim() === '') {
      return {
        status: 'success',
        status_code: 200,
        message: 'No search term provided',
        data: { categories: [], total: 0 },
      };
    }

    // Perform a case-insensitive search
    const categories = await this.blogCategoryRepository
      .createQueryBuilder('category')
      .where('LOWER(category.name) LIKE LOWER(:searchTerm)', {
        searchTerm: `%${searchTerm}%`,
      })
      .getMany();

    // Return the results in the desired format
    return {
      status: 'success',
      status_code: 200,
      message: categories.length > 0 ? 'Categories found successfully' : 'No categories found',
      data: { categories, total: categories.length },
    };
  }
}