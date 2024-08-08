import * as SYS_MSG from '../../helpers/SystemMessages';
import { HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like, MoreThanOrEqual, FindOptionsWhere } from 'typeorm';
import { Blog } from './entities/blog.entity';
import { User } from '../user/entities/user.entity';
import { CreateBlogDto } from './dtos/create-blog.dto';
import { UpdateBlogDto } from './dtos/update-blog.dto';
import { CustomHttpException } from '../../helpers/custom-http-filter';
import { BlogResponseDto } from './dtos/blog-response.dto';

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

  async getSingleBlog(blogId: string, user: User): Promise<any> {
    const singleBlog = await this.blogRepository.findOneBy({ id: blogId });
    const fullName = await this.fetchUserById(user.id);

    if (!singleBlog) {
      throw new CustomHttpException(SYS_MSG.BLOG_NOT_FOUND, HttpStatus.NOT_FOUND);
    }

    const { id, created_at, updated_at, ...rest } = singleBlog;
    const author = `${fullName.first_name} ${fullName.last_name}`;

    return {
      status_code: 200,
      message: SYS_MSG.BLOG_FETCHED_SUCCESSFUL,
      data: { blog_id: id, ...rest, author, published_date: created_at },
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
  async deleteBlogPost(id: string): Promise<void> {
    const blog = await this.blogRepository.findOne({ where: { id } });
    if (!blog) {
      throw new CustomHttpException('Blog post with this id does not exist.', HttpStatus.NOT_FOUND);
    } else await this.blogRepository.remove(blog);
  }

  async getAllBlogs(
    page: number,
    pageSize: number
  ): Promise<{
    status_code: number;
    message: string;
    data: { currentPage: number; totalPages: number; totalResults: number; blogs: BlogResponseDto[]; meta: any };
  }> {
    const skip = (page - 1) * pageSize;

    const [result, total] = await this.blogRepository.findAndCount({
      skip,
      take: pageSize,
      relations: ['author'],
    });

    const data = this.mapBlogResults(result);
    const totalPages = Math.ceil(total / pageSize);

    return {
      status_code: HttpStatus.OK,
      message: SYS_MSG.BLOG_FETCHED_SUCCESSFUL,
      data: {
        currentPage: page,
        totalPages,
        totalResults: total,
        blogs: data,
        meta: {
          hasNext: page < totalPages,
          total,
          nextPage: page < totalPages ? page + 1 : null,
          prevPage: page > 1 ? page - 1 : null,
        },
      },
    };
  }

  async searchBlogs(query: any): Promise<{
    status_code: number;
    message: string;
    data: { current_page: number; total_pages: number; total_results: number; blogs: BlogResponseDto[]; meta: any };
  }> {
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
      return {
        status_code: HttpStatus.NOT_FOUND,
        message: 'no_results_found_for_the_provided_search_criteria',
        data: {
          current_page: page,
          total_pages: 0,
          total_results: 0,
          blogs: [],
          meta: {
            has_next: false,
            total: 0,
            next_page: null,
            prev_page: null,
          },
        },
      };
    }

    const data = this.mapBlogResults(result);
    const totalPages = Math.ceil(total / page_size);

    return {
      status_code: HttpStatus.OK,
      message: SYS_MSG.BLOG_FETCHED_SUCCESSFUL,
      data: {
        current_page: page,
        total_pages: totalPages,
        total_results: total,
        blogs: data,
        meta: {
          has_next: page < totalPages,
          total,
          next_page: page < totalPages ? page + 1 : null,
          prev_page: page > 1 ? page - 1 : null,
        },
      },
    };
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
          throw new CustomHttpException(`${key.replace(/_/g, ' ')} value is empty`, HttpStatus.BAD_REQUEST);
        }
      }
    }
  }

  private mapBlogResults(result: Blog[]): BlogResponseDto[] {
    return result.map(blog => {
      if (!blog.author) {
        throw new CustomHttpException('author_not_found', HttpStatus.INTERNAL_SERVER_ERROR);
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
