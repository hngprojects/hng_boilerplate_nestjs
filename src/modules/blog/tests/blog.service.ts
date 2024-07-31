import { Injectable, NotFoundException, Inject, BadRequestException, HttpException, HttpStatus } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Blog } from '../entities/blog.entity';
import { EditBlogPost } from '../dto/edit-blog.dto';
import { CreateBlogPost } from '../dto/create-blog.dto';
import { BlogPostCategory } from '../entities/blog-category.entity';
import { User } from '../../user/entities/user.entity';
import UserService from '../../user/user.service';
@Injectable()
export class BlogService {
  constructor(
    @InjectRepository(Blog)
    private readonly blogRepository: Repository<Blog>,
    @InjectRepository(BlogPostCategory)
    private readonly categoryRepository: Repository<BlogPostCategory>
  ) {}

  async createBlogPost(author: string, createBlogPost: CreateBlogPost) {
    try {
      const user = await this.blogRepository.findOne({ where: { id: createBlogPost.category_id } });
      if (!user) {
        throw new NotFoundException('User not found');
      }

      if (createBlogPost.category_id) {
        const category = await this.categoryRepository.findOne({ where: { id: createBlogPost.category_id } });
        if (!category) {
          throw new NotFoundException('Category not found');
        }
      }

      const blog = this.blogRepository.create({
        ...createBlogPost,
      });
      await this.blogRepository.save(blog);
    } catch (error) {
      throw new HttpException(
        {
          status: 'error',
          message: 'Error creating blog post',
          status_code: HttpStatus.INTERNAL_SERVER_ERROR,
        },
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  async getAllBlogs(): Promise<Blog[]> {
    try {
      return await this.blogRepository.find({ relations: ['user', 'category'] });
    } catch (error) {
      throw new HttpException(
        {
          status: 'error',
          message: 'Error retrieving blogs',
          status_code: HttpStatus.INTERNAL_SERVER_ERROR,
        },
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  async getBlogById(id: string): Promise<Blog> {
    const blog = await this.blogRepository.findOne({ where: { id }, relations: ['user', 'category'] });
    if (!blog) {
      throw new NotFoundException('Blog not found');
    }
    return blog;
  }

  async editBlogPost(id: string, editBlogPostDto: EditBlogPost): Promise<Blog> {
    const blog = await this.blogRepository.findOne({ where: { id }, relations: ['user', 'category'] });
    if (!blog) {
      throw new NotFoundException('Blog not found');
    }

    if (editBlogPostDto.category_Id) {
      const category = await this.categoryRepository.findOne({ where: { id: editBlogPostDto.category_Id } });
      if (!category) {
        throw new NotFoundException('Category not found');
      }
      blog.category_id = category;
    }

    if (editBlogPostDto.title) {
      blog.title = editBlogPostDto.title;
    }

    if (editBlogPostDto.content) {
      blog.content = editBlogPostDto.content;
    }

    return await this.blogRepository.save(blog);
  }

  async deleteBlogPost(id: string): Promise<void> {
    const blog = await this.blogRepository.findOne({ where: { id } });
    if (!blog) {
      throw new NotFoundException('Blog not found');
    }

    try {
      await this.blogRepository.remove(blog);
    } catch (error) {
      throw new HttpException(
        {
          status: 'error',
          message: 'Error deleting blog post',
          status_code: HttpStatus.INTERNAL_SERVER_ERROR,
        },
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }
}
