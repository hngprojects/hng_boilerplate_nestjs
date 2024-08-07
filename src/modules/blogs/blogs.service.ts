import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like, MoreThanOrEqual, FindOptionsWhere } from 'typeorm';
import { Blog } from './entities/blog.entity';
import { User } from '../user/entities/user.entity';
import { CreateBlogDto } from './dtos/create-blog.dto';
import { BlogResponseDto } from './dtos/blog-response.dto';
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

  async searchBlogs(query: any): Promise<{ data: BlogResponseDto[]; total: number }> {
    const { page = 1, page_size = 10 } = query;
    const skip = (page - 1) * page_size;

    this.validateEmptyValues(query);

    const where: FindOptionsWhere<Blog> = this.buildWhereClause(query);

    const [result, total] = await this.blogRepository.findAndCount({
      where: Object.keys(where).length ? where : undefined,
      skip,
      take: page_size,
      relations: ['author'],
    });

    if (!result || result.length === 0) {
      CustomExceptionHandler({
        response: 'No results found for the provided search criteria',
        status: 404,
      });
      return { data: [], total: 0 };
    }

    const data = this.mapBlogResults(result);
    return { data, total };
  }

  private buildWhereClause(query: any): FindOptionsWhere<Blog> {
    const where: FindOptionsWhere<Blog> = {};

    if (query.author !== undefined) {
      where.author = {
        first_name: Like(`%${query.author}%`),
        last_name: Like(`%${query.author}%`),
      };
    }
    if (query.title !== undefined) {
      where.title = Like(`%${query.title}%`);
    }
    if (query.content !== undefined) {
      where.content = Like(`%${query.content}%`);
    }
    if (query.tags !== undefined) {
      where.tags = Like(`%${query.tags}%`);
    }
    if (query.created_date !== undefined) {
      where.created_at = MoreThanOrEqual(new Date(query.created_date));
    }

    return where;
  }

  private validateEmptyValues(query: any): void {
    for (const key in query) {
      if (query.hasOwnProperty(key) && query[key] !== undefined) {
        const value = query[key];
        if (typeof value === 'string' && !value.trim()) {
          CustomExceptionHandler({
            response: `${key.charAt(0).toUpperCase() + key.slice(1)} value is empty`,
            status: 400,
          });
        }
      }
    }
  }

  private mapBlogResults(result: Blog[]): BlogResponseDto[] {
    return result.map(blog => {
      if (!blog.author) {
        CustomExceptionHandler({
          response: 'Author not found',
          status: 500,
        });
      }
      const author_name = blog.author ? `${blog.author.first_name} ${blog.author.last_name}` : 'Unknown';
      return {
        blog_id: blog.id,
        title: blog.title,
        content: blog.content,
        tags: blog.tags,
        image_urls: blog.image_urls,
        author: author_name,
        created_at: blog.created_at,
      };
    });
  }
}
