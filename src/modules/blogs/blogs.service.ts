import { BadRequestException, Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { CreateBlogDto } from './dto/create-blog.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Blog } from './entities/blog.entity';
import { Repository } from 'typeorm';
import { User } from '../user/entities/user.entity';
import CustomExceptionHandler from '../../helpers/exceptionHandler';

@Injectable()
export class BlogsService {
  constructor(
    @InjectRepository(Blog)
    private blogRepository: Repository<Blog>,
    @InjectRepository(User)
    private userRepository: Repository<User>
  ) {}

  async createBlog(createBlogDto: CreateBlogDto, user: User): Promise<Blog> {
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

    return this.blogRepository.save(blog);
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
  async deleteBlogPost(id: string): Promise<void> {
    const blog = await this.blogRepository.findOne({ where: { id } });

    if (!blog) {
      throw new NotFoundException('Blog with the given Id does not exist');
    }

    try {
      await this.blogRepository.remove(blog);
    } catch (error) {
      throw new InternalServerErrorException('Internal server error');
    }
  }
}
