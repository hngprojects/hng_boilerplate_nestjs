import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Blog } from './entities/blog.entity';
import { User } from '../user/entities/user.entity';
import { CreateBlogDto } from './dtos/create-blog.dto';

@Injectable()
export class BlogService {
  constructor(
    @InjectRepository(Blog)
    private blogRepository: Repository<Blog>
  ) {}

  async createBlog(createBlogDto: CreateBlogDto, user: User): Promise<Blog> {
    const blog = this.blogRepository.create({
      ...createBlogDto,
      author: user,
    });

    return this.blogRepository.save(blog);
  }
}
