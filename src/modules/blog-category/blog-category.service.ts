import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { BlogCategory } from './entities/blog-category.entity';
import { Repository } from 'typeorm';
import { CreateBlogCategoryDto } from './dto/create-blog-category.dto';
import { CustomHttpException } from '../../helpers/custom-http-filter';
import { BLOG_CATEGORY_FETCHED, BLOG_CATEGORY_UPDATED, CATEGORY_NOT_FOUND } from '../../helpers/SystemMessages';

@Injectable()
export class BlogCategoryService {
  constructor(
    @InjectRepository(BlogCategory)
    private blogCategoryRepository: Repository<BlogCategory>
  ) {}

  async createBlogCategory(createBlogCategoryDto: CreateBlogCategoryDto) {
    const blogCategory = this.blogCategoryRepository.create(createBlogCategoryDto);
    await this.blogCategoryRepository.save(blogCategory);

    return { data: blogCategory, message: 'Blog category created successfully.' };
  }

  async findOneBlogCategory(id: string) {
    const blogCategory = await this.blogCategoryRepository.findOne({ where: { id: id } });

    if (!blogCategory) {
      throw new CustomHttpException(CATEGORY_NOT_FOUND, 404);
    }

    const responseData = {
      message: BLOG_CATEGORY_FETCHED,
      data: blogCategory,
    };

    return responseData;
  }

  async updateBlogCategory(id: string, updateBlogCategoryDto: CreateBlogCategoryDto) {
    const category = await this.blogCategoryRepository.findOne({ where: { id } });
    if (!category) {
      throw new CustomHttpException(CATEGORY_NOT_FOUND, 404);
    }
    Object.assign(category, updateBlogCategoryDto);
    await this.blogCategoryRepository.save(category);
    return { data: category, message: BLOG_CATEGORY_UPDATED };
  }
}
