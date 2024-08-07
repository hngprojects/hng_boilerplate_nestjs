import { HttpStatus, Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Blog } from './entities/blog.entity';
import { User } from '../user/entities/user.entity';
import { CreateBlogDto } from './dtos/create-blog.dto';
import { UpdateBlogDto } from './dtos/update-blog.dto';
import { BlogResponseDto } from './dtos/blog-response.dto';
import { CustomHttpException } from '../../helpers/custom-http-filter';

@Injectable()
export class BlogService {
  constructor(
    @InjectRepository(Blog)
    private blogRepository: Repository<Blog>,
    @InjectRepository(User)
    private userRepository: Repository<User>
  ) {}

  private async fetchUserById(userId: string): Promise<User> {
    const user = await this.userRepository.findOne({
      where: { id: userId },
      select: ['first_name', 'last_name'],
    });

    if (!user) {
      throw new CustomHttpException('User not found.', HttpStatus.NOT_FOUND);
    }

    return user;
  }

  async createBlog(createBlogDto: CreateBlogDto, user: User): Promise<BlogResponseDto> {
    const fullUser = await this.fetchUserById(user.id);

    const blog = this.blogRepository.create({
      ...createBlogDto,
      author: fullUser,
    });

    const savedBlog = await this.blogRepository.save(blog);

    return {
      blog_id: savedBlog.id,
      title: savedBlog.title,
      content: savedBlog.content,
      tags: savedBlog.tags,
      image_urls: savedBlog.image_urls,
      author: `${fullUser.first_name} ${fullUser.last_name}`,
      created_at: savedBlog.created_at,
    };
  }

  async getAllBlogs(page = 1, page_size = 10) {
    if (!Number.isInteger(page) || page < 1) {
      throw new BadRequestException('Page number must be a positive integer');
    }

    if (!Number.isInteger(page_size) || page_size < 1) {
      throw new BadRequestException('Page size must be a positive integer');
    }

    const [blogs, total] = await this.blogRepository.findAndCount({
      skip: (page - 1) * page_size,
      take: page_size,
      order: {
        created_at: 'DESC',
      },
    });

    const nextLink = `http://example.com/api/v1/blogs?page=${page + 1}&page_size=10`;
    const previous = page <= 1 ? null : page - 1;

    return {
      status_code: 200,
      message: 'Blogs retrieved successfully',
      count: total,
      next: nextLink,
      previous,
      data: blogs,
      page,
      page_size,
    };
  }

  async updateBlog(id: string, updateBlogDto: UpdateBlogDto, user: User): Promise<BlogResponseDto> {
    const blog = await this.blogRepository.findOne({
      where: { id },
      relations: ['author'],
    });

    if (!blog) {
      throw new CustomHttpException('Blog post not found.', HttpStatus.NOT_FOUND);
    }

    const fullUser = await this.fetchUserById(user.id);

    Object.assign(blog, updateBlogDto, { author: fullUser });

    const updatedBlog = await this.blogRepository.save(blog);

    return {
      blog_id: updatedBlog.id,
      title: updatedBlog.title,
      content: updatedBlog.content,
      tags: updatedBlog.tags,
      image_urls: updatedBlog.image_urls,
      author: `${updatedBlog.author.first_name} ${updatedBlog.author.last_name}`,
      created_at: updatedBlog.created_at,
    };
  }
}
