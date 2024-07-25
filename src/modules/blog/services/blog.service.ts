import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Blog } from '../entities/blog.entity';
import { CreateBlogDto } from '../dto/create-blog.dto';
import { EditBlogDto } from '../dto/edit-blog.dto';
import { User } from '../../user/entities/user.entity';
import { BlogCategory } from '../entities/blog-category.entity';

@Injectable()
export class BlogService {
  constructor(
    @InjectRepository(Blog)
    private readonly blogRepository: Repository<Blog>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(BlogCategory)
    private readonly categoryRepository: Repository<BlogCategory>
  ) {}

  async create(createBlogDto: CreateBlogDto): Promise<Blog> {
    const { authorId, categoryId, ...rest } = createBlogDto;

    const author = await this.userRepository.findOne({ where: { id: authorId } });
    if (!author) {
      throw new NotFoundException('User not found');
    }

    const category = await this.categoryRepository.findOne({ where: { id: categoryId } });
    if (!category) {
      throw new NotFoundException('Category not found');
    }

    const blog = this.blogRepository.create({ ...rest, author, category });
    return await this.blogRepository.save(blog);
  }

  async editBlog(id: string, editBlogDto: EditBlogDto): Promise<Blog> {
    const blog = await this.blogRepository.findOne({ where: { id }, relations: ['author', 'category'] });
    if (!blog) {
      throw new NotFoundException('Blog not found');
    }

    if (editBlogDto.categoryId) {
      const category = await this.categoryRepository.findOne({ where: { id: editBlogDto.categoryId } });
      if (!category) {
        throw new NotFoundException('Category not found');
      }
      blog.category = category;
    }

    if (editBlogDto.title) {
      blog.title = editBlogDto.title;
    }

    if (editBlogDto.content) {
      blog.content = editBlogDto.content;
    }

    return await this.blogRepository.save(blog);
  }
}
