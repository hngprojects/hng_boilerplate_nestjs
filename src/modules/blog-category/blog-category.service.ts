import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { BlogCategory } from './entities/blog-category.entity';
import { Repository } from 'typeorm';
import { CreateBlogCategoryDto } from './dto/create-blog-category.dto';

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
}
