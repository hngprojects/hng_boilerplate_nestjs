import * as SYS_MSG from '@shared/constants/SystemMessages';
import { HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like, MoreThanOrEqual, FindOptionsWhere } from 'typeorm';
import { Blog } from './entities/blog.entity';
import { CreateBlogDto } from './dtos/create-blog.dto';
import { UpdateBlogDto } from './dtos/update-blog.dto';
import { CustomHttpException } from '@shared/helpers/custom-http-filter';
import { BlogResponseDto } from './dtos/blog-response.dto';
import { User } from '@modules/user/entities/user.entity';

@Injectable()
export class BlogService {
  constructor(
    @InjectRepository(Blog) private blogRepository: Repository<Blog>,
    @InjectRepository(User) private userRepository: Repository<User>
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

  private async findBlogById(id: string, relations: string[] = []): Promise<Blog> {
    const blog = await this.blogRepository.findOne({ where: { id }, relations });
    if (!blog) {
      throw new CustomHttpException(SYS_MSG.BLOG_NOT_FOUND, HttpStatus.NOT_FOUND);
    }
    return blog;
  }

  async createBlog(createBlogDto: CreateBlogDto, user: User): Promise<BlogResponseDto> {
    const fullUser = await this.fetchUserById(user.id);

    const blog = this.blogRepository.create({ ...createBlogDto, author: fullUser });
    const savedBlog = await this.blogRepository.save(blog);

    return this.formatBlogResponse(savedBlog);
  }

  async getSingleBlog(blogId: string): Promise<any> {
    const blog = await this.findBlogById(blogId, ['author']);

    return {
      status_code: HttpStatus.OK,
      message: SYS_MSG.BLOG_FETCHED_SUCCESSFUL,
      data: this.formatBlogResponse(blog),
    };
  }

  async updateBlog(id: string, updateBlogDto: UpdateBlogDto, user: User): Promise<BlogResponseDto> {
    const blog = await this.findBlogById(id, ['author']);
    const fullUser = await this.fetchUserById(user.id);

    Object.assign(blog, updateBlogDto, { author: fullUser });
    const updatedBlog = await this.blogRepository.save(blog);

    return this.formatBlogResponse(updatedBlog);
  }

  async deleteBlogPost(id: string): Promise<void> {
    const blog = await this.findBlogById(id);
    await this.blogRepository.remove(blog);
  }

  async getAllBlogs(page: number, pageSize: number) {
    const skip = (page - 1) * pageSize;
    const [result, total] = await this.blogRepository.findAndCount({ skip, take: pageSize, relations: ['author'] });

    return this.formatPaginatedResponse(result, total, page, pageSize, SYS_MSG.BLOG_FETCHED_SUCCESSFUL);
  }

  async searchBlogs(query: any) {
    const { page = 1, page_size = 10 } = query;
    const skip = (page - 1) * page_size;

    this.validateEmptyValues(query);
    const where = this.buildWhereClause(query);

    const [result, total] = await this.blogRepository.findAndCount({
      where: Object.keys(where).length ? where : undefined,
      skip,
      take: page_size,
      relations: ['author'],
    });

    return this.formatPaginatedResponse(
      result,
      total,
      page,
      page_size,
      result.length ? SYS_MSG.BLOG_FETCHED_SUCCESSFUL : 'No results found.'
    );
  }

  private buildWhereClause(query: any): FindOptionsWhere<Blog> {
    const where: FindOptionsWhere<Blog> = {};
    if (query.author) where.author = { first_name: Like(`%${query.author}%`), last_name: Like(`%${query.author}%`) };
    if (query.title) where.title = Like(`%${query.title}%`);
    if (query.content) where.content = Like(`%${query.content}%`);
    if (query.tags) where.tags = Like(`%${query.tags}%`);
    if (query.created_date) where.created_at = MoreThanOrEqual(new Date(query.created_date));
    return where;
  }

  private validateEmptyValues(query: any): void {
    for (const key in query) {
      if (query[key] !== undefined && typeof query[key] === 'string' && !query[key].trim()) {
        throw new CustomHttpException(`${key.replace(/_/g, ' ')} value is empty`, HttpStatus.BAD_REQUEST);
      }
    }
  }

  private formatBlogResponse(blog: Blog): BlogResponseDto {
    return {
      blog_id: blog.id,
      title: blog.title,
      content: blog.content,
      tags: blog.tags,
      image_urls: blog.image_urls,
      author: blog.author ? `${blog.author.first_name} ${blog.author.last_name}` : 'Unknown',
      created_at: blog.created_at,
    };
  }

  private formatPaginatedResponse(result: Blog[], total: number, page: number, pageSize: number, message: string) {
    const totalPages = Math.ceil(total / pageSize);

    return {
      status_code: total > 0 ? HttpStatus.OK : HttpStatus.NOT_FOUND,
      message,
      data: {
        current_page: page,
        total_pages: totalPages,
        total_results: total,
        blogs: result.map(blog => this.formatBlogResponse(blog)),
        meta: {
          has_next: page < totalPages,
          total,
          next_page: page < totalPages ? page + 1 : null,
          prev_page: page > 1 ? page - 1 : null,
        },
      },
    };
  }
}
