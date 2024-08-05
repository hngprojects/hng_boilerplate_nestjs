import { Controller, Post, Body, UseGuards, Request } from '@nestjs/common';
import { BlogService } from './blog.service';
import { SuperAdminGuard } from '../../guards/super-admin.guard';
import { User } from '../user/entities/user.entity';
import { CreateBlogDto } from './dtos/create-blog.dto';
import { BlogResponseDto } from './dtos/blog-response.dto';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';

@ApiTags('blogs')
@Controller('/blogs')
export class BlogController {
  constructor(private readonly blogService: BlogService) {}

  @Post()
  @UseGuards(SuperAdminGuard)
  @ApiOperation({ summary: 'Create a new blog' })
  @ApiResponse({ status: 201, description: 'The blog has been successfully created.', type: BlogResponseDto })
  @ApiResponse({ status: 403, description: 'Forbidden.' })
  async createBlog(@Body() createBlogDto: CreateBlogDto, @Request() req): Promise<BlogResponseDto> {
    const user: User = req.user;
    const blog = await this.blogService.createBlog(createBlogDto, user);

    const author = `${blog.author.first_name} ${blog.author.last_name}`;

    return {
      blog_id: blog.id,
      title: blog.title,
      content: blog.content,
      tags: blog.tags,
      image_urls: blog.image_urls,
      author: author,
      created_at: blog.created_at,
    };
  }
}
