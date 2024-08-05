import { Controller, Post, Body, UseGuards, Request } from '@nestjs/common';
import { BlogService } from './blog.service';
import { AuthGuard } from '../../guards/auth.guard';
import { SuperAdminGuard } from '../../guards/super-admin.guard';
import { User } from '../user/entities/user.entity';
import { CreateBlogDto } from './dtos/create-blog.dto';
import { BlogResponseDto } from './dtos/blog-response.dto';

@Controller('/blogs')
export class BlogController {
  constructor(private readonly blogService: BlogService) {}

  @Post()
  @UseGuards(AuthGuard, SuperAdminGuard)
  async createBlog(@Body() createBlogDto: CreateBlogDto, @Request() req): Promise<BlogResponseDto> {
    const user: User = req.user;
    const blog = await this.blogService.createBlog(createBlogDto, user);

    return {
      blog_id: blog.blog_id,
      title: blog.title,
      content: blog.content,
      tags: blog.tags,
      image_urls: blog.image_urls,
      author: `${user.first_name} ${user.last_name}`,
      created_at: blog.created_at,
    };
  }
}
