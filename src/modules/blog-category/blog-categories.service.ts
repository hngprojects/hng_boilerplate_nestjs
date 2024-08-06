import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { BlogCategory } from './entities/blog-category.entity';
import { Repository } from 'typeorm';
import { CreateBlogCategoryDto } from './dto/create-blog-category.dto';

@Injectable()
export class BlogCategoriesService {
  constructor(
    @InjectRepository(BlogCategory)
    private blogCategoryRepository: Repository<BlogCategory>
  ) {}

  async create(createBlogCategoryDto: CreateBlogCategoryDto): Promise<BlogCategory> {
    const blogCategory = this.blogCategoryRepository.create(createBlogCategoryDto);
    return this.blogCategoryRepository.save(blogCategory);
  }
}
