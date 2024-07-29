import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Blog } from './entities/blog.entity';

@Injectable()
export class BlogService {
  private readonly logger = new Logger(BlogService.name);

  constructor(
    @InjectRepository(Blog)
    private readonly blogRepository: Repository<Blog>
  ) {}

  /**
   * Finds the latest blog posts.
   * @param limit - The number of blog posts to return. Defaults to 5
   * @throws {NotFoundException} - If no blog posts are found.
   */
  async findLatest(limit: number = 5): Promise<Blog[]> {
    if (limit <= 0) {
      throw new Error('Limit must be a positive number');
    }

    try {
      const blogs = await this.blogRepository.find({
        order: { createdAt: 'DESC' },
        take: limit,
      });

      if (blogs.length === 0) {
        this.logger.warn('No blog posts found');
        throw new NotFoundException('No blog posts found');
      }

      return blogs;
    } catch (error) {
      this.logger.error('Error fetching latest blog posts', error.stack);
      throw new Error('Unable to fetch latest blog posts');
    }
  }
}
