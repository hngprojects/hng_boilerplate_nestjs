import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Blog } from './entities/blog.entity';
import { User } from '../user/entities/user.entity';
import { CreateBlogDto } from './dtos/create-blog.dto';
import CustomExceptionHandler from '../../helpers/exceptionHandler';

@Injectable()
export class BlogService {
  constructor(
    @InjectRepository(Blog)
    private blogRepository: Repository<Blog>,
    @InjectRepository(User)
    private userRepository: Repository<User>
  ) {}

  async createBlog(createBlogDto: CreateBlogDto, user: User): Promise<any> {
    const fullUser = await this.userRepository.findOne({
      where: { id: user.id },
      select: ['first_name', 'last_name'],
    });

    if (!fullUser) {
      CustomExceptionHandler({
        response: 'User not found',
        status: 404,
      });
    }

    const blog = this.blogRepository.create({
      ...createBlogDto,
      author: fullUser,
    });

    const savedBlog = await this.blogRepository.save(blog);
    const author = `${fullUser.first_name} ${fullUser.last_name}`;

    return {
      blog_id: savedBlog.id,
      title: savedBlog.title,
      content: savedBlog.content,
      tags: savedBlog.tags,
      image_urls: savedBlog.image_urls,
      author: author,
      created_at: savedBlog.created_at,
    };
  }

  async findAll(page = 1, page_size = 10) {
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
}
