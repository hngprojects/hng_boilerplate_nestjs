import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like, MoreThanOrEqual, FindOptionsWhere } from 'typeorm';
import { Blog } from './entities/blog.entity';
import { User } from '../user/entities/user.entity';
import { CreateBlogDto } from './dtos/create-blog.dto';
import { BlogResponseDto } from './dtos/blog-response.dto';

@Injectable()
export class BlogService {
  private readonly logger = new Logger(BlogService.name);

  constructor(
    @InjectRepository(Blog)
    private blogRepository: Repository<Blog>,
    @InjectRepository(User)
    private userRepository: Repository<User>
  ) {}

  async createBlog(createBlogDto: CreateBlogDto, user: User): Promise<BlogResponseDto> {
    const fullUser = await this.userRepository.findOne({
      where: { id: user.id },
      select: ['first_name', 'last_name'],
    });

    if (!fullUser) {
      this.logger.error('User not found');
      throw new Error('User not found');
    }

    const blog = this.blogRepository.create({
      ...createBlogDto,
      author: fullUser,
    });

    const savedBlog = await this.blogRepository.save(blog);
    const author = `${fullUser.first_name} ${fullUser.last_name}`;

    return {
      id: savedBlog.id,
      title: savedBlog.title,
      content: savedBlog.content,
      tags: savedBlog.tags,
      image_urls: savedBlog.image_urls,
      author: author,
      createdDate: savedBlog.created_at.toISOString(),
    };
  }

  async searchBlogs(query: any): Promise<{ data: BlogResponseDto[]; total: number }> {
    const { author, title, content, tags, createdDate, page = 1, pageSize = 10 } = query;
    const skip = (page - 1) * pageSize;

    const where: FindOptionsWhere<Blog> = {};

    if (author) {
      where.author = {
        first_name: Like(`%${author}%`),
        last_name: Like(`%${author}%`),
      };
    }
    if (title) {
      where.title = Like(`%${title}%`);
    }
    if (content) {
      where.content = Like(`%${content}%`);
    }
    if (tags) {
      where.tags = Like(`%${tags}%`);
    }
    if (createdDate) {
      where.created_at = MoreThanOrEqual(new Date(createdDate));
    }

    this.logger.debug(`Search Criteria: ${JSON.stringify(where)}`);

    try {
      const [result, total] = await this.blogRepository.findAndCount({
        where: Object.keys(where).length ? where : undefined,
        skip,
        take: pageSize,
        relations: ['author'],
      });

      this.logger.debug(`Search Results: ${JSON.stringify(result)}`);

      const data = result.map(blog => ({
        id: blog.id,
        title: blog.title,
        content: blog.content,
        tags: blog.tags,
        image_urls: blog.image_urls,
        author: `${blog.author.first_name} ${blog.author.last_name}`,
        createdDate: blog.created_at.toISOString(),
      }));

      return { data, total };
    } catch (error) {
      this.logger.error('Error executing search query', error.stack);
      throw new Error('Error executing search query');
    }
  }
}
