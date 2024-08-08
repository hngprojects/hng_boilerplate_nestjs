import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { BlogCategory } from './entities/blog-category.entity';
import { Repository } from 'typeorm';
import { CreateBlogCategoryDto } from './dto/create-blog-category.dto';
import { CustomHttpException } from '../../helpers/custom-http-filter';
import { CATEGORY_NOT_FOUND, ORG_NOT_FOUND } from '../../helpers/SystemMessages';

@Injectable()
export class BlogCategoryService {
  constructor(
    @InjectRepository(BlogCategory)
    private blogCategoryRepository: Repository<BlogCategory>
  ) {}

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
}
