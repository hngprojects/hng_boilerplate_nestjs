import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Blog } from '../entities/blog.entity';
import { EditBlogPost } from '../dto/edit-blog.dto';
import { BlogPostCategory } from '../entities/blog-category.entity';

@Injectable()
export class BlogPostService {
  constructor(
    @InjectRepository(Blog)
    private readonly blogRepository: Repository<Blog>,
    @InjectRepository(BlogPostCategory)
    private readonly categoryRepository: Repository<BlogPostCategory>
  ) {}

  async editBlogPost(id: string, editBlogPost: EditBlogPost): Promise<Blog> {
    const blog = await this.blogRepository.findOne({ where: { id }, relations: ['author', 'category'] });
    if (!blog) {
      throw new NotFoundException('Blog not found');
    }

    if (editBlogPost.categoryId) {
      const category = await this.categoryRepository.findOne({ where: { id: editBlogPost.categoryId } });
      if (!category) {
        throw new NotFoundException('Category not found');
      }
      blog.category = category;
    }

    if (editBlogPost.title) {
      blog.title = editBlogPost.title;
    }

    if (editBlogPost.content) {
      blog.content = editBlogPost.content;
    }

    return await this.blogRepository.save(blog);
  }
}
