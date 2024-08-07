import { Controller, Post, Body, UseGuards, Request, Get, Query } from '@nestjs/common';
import { BlogService } from './blogs.service';
import { SuperAdminGuard } from '../../guards/super-admin.guard';
import { CreateBlogDto } from './dtos/create-blog.dto';
import { BlogResponseDto } from './dtos/blog-response.dto';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { skipAuth } from 'src/helpers/skipAuth';

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
    return await this.blogService.createBlog(createBlogDto, req.user);
  }

  @skipAuth()
  @ApiOperation({ summary: 'Get All Blogs' })
  @ApiResponse({ status: 200, description: 'Blogs retrieved successfully', type: BlogResponseDto })
  @ApiResponse({ status: 400, description: 'Page or Page_size must be a positive number' })
  @Get()
  async findAll(@Query('page') page: number = 1, @Query('page_size') page_size: number = 10) {
    const result = await this.blogService.findAll(page, page_size);
    return result;
  }
}
