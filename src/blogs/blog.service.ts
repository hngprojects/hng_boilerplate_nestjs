import { Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Blog } from './blog.entity';
import { UpdateBlogDto } from './dto/update-blog.dto';

@Injectable()
export class BlogService {
  constructor(
    @InjectRepository(Blog)
    private readonly blogRepository: Repository<Blog>,
  ) {}

  async updateBlog(blogId: number, updateBlogDto: UpdateBlogDto, isAdmin: boolean): Promise<Blog> {
    if (!isAdmin) {
      throw new UnauthorizedException('Unauthorized request');
    }

    const blog = await this.blogRepository.findOne(blogId);
    if (!blog) {
      throw new NotFoundException('Blog not found');
    }

    blog.title = updateBlogDto.title;
    blog.excerpt = updateBlogDto.excerpt;
    blog.tags = updateBlogDto.tags;

    return this.blogRepository.save(blog);
  }
}
