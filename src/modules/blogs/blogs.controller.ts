import { Controller, Post, Body, UseGuards, Request } from '@nestjs/common';
import { BlogService } from './blogs.service';
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
  async createBlog(@Body() createBlogDto: CreateBlogDto, @Request() req): Promise<any> {
    const blog = await this.blogService.createBlog(createBlogDto, req.user);
    return {
      message: 'Blog created successfully',
      data: {
        blog_id: blog.blog_id,
        title: blog.title,
        content: blog.content,
        image_urls: blog.image_urls,
        tags: blog.tags,
        author: blog.author,
        created_at: blog.created_at,
      },
    };
  }
}
