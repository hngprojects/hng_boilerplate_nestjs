import { Controller, Get, Post, Body, Query, UseGuards, Request } from '@nestjs/common';
import { BlogsService } from './blogs.service';
import { CreateBlogDto } from './dto/create-blog.dto';
import { skipAuth } from 'src/helpers/skipAuth';
import { SuperAdminGuard } from 'src/guards/super-admin.guard';
import { ApiOperation, ApiResponse } from '@nestjs/swagger';
import { BlogResponseDto } from './dto/blog-response-dto';
import { User } from '../user/entities/user.entity';

@Controller('blogs')
export class BlogsController {
  constructor(private readonly blogsService: BlogsService) {}

  @Post()
  @UseGuards(SuperAdminGuard)
  @ApiOperation({ summary: 'Create a new blog' })
  @ApiResponse({ status: 201, description: 'The blog has been successfully created.', type: BlogResponseDto })
  @ApiResponse({ status: 403, description: 'Forbidden.' })
  async createBlog(@Body() createBlogDto: CreateBlogDto, @Request() req): Promise<BlogResponseDto> {
    const user: User = req.user;
    const blog = await this.blogsService.createBlog(createBlogDto, user);

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

  @skipAuth()
  @Get()
  async findAll(@Query('page') page: number = 1, @Query('page_size') page_size: number = 10) {
    const result = await this.blogsService.findAll(page, page_size);
    return result;
  }
}
