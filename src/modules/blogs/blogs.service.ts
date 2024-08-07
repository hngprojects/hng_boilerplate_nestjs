import * as SYS_MSG from '../../helpers/SystemMessages';
import { Injectable } from '@nestjs/common';
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

  async getSingleBlog(blogId: string, user: User): Promise<any> {
    const singleBlog = await this.blogRepository.findOneBy({ id: blogId });
    const fullName = await this.userRepository.findOne({
      where: { id: user.id },
      select: ['first_name', 'last_name'],
    });

    if (!singleBlog) {
      CustomExceptionHandler({
        response: SYS_MSG.BLOG_NOT_FOUND,
        status: 404,
      });
    }

    const { id, created_at, updated_at, ...rest } = singleBlog;
    const author = `${fullName.first_name} ${fullName.last_name}`;

    return {
      status: 200,
      message: SYS_MSG.BLOG_FETCHED_SUCCESSFUL,
      data: { blog_id: id, ...rest, author, published_date: created_at },
    };
  }
}
