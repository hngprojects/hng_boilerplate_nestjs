import { HttpStatus, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Blog } from './entities/blog.entity';
import { User } from '../user/entities/user.entity';
import { CreateBlogDto } from './dtos/create-blog.dto';
import { UpdateBlogDto } from './dtos/update-blog.dto';
import { BlogResponseDto } from './dtos/blog-response.dto';
import { CustomHttpException } from '../../helpers/custom-http-filter';

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

  async deleteBlogPost(id: string): Promise<void> {
    const blog = await this.blogRepository.findOne({ where: { id } });

    if (!blog) {
      CustomExceptionHandler({
        response: 'Blog with this Id does not exist',
        status: 404,
      });
    } else await this.blogRepository.remove(blog);
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
}
