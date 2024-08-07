import { Controller, Post, Body, UseGuards, Request, Get, Query } from '@nestjs/common';
import { BlogService } from './blogs.service';
import { SuperAdminGuard } from '../../guards/super-admin.guard';
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
    return await this.blogService.createBlog(createBlogDto, req.user);
  }

  @Get('/search')
  @ApiOperation({ summary: 'Search and filter blogs' })
  @ApiResponse({ status: 200, description: 'Search results returned successfully.', type: [BlogResponseDto] })
  async searchBlogs(@Query() query: any): Promise<any> {
    const { data, total } = await this.blogService.searchBlogs(query);
    const totalPages = Math.ceil(total / (query.pageSize || 10));

    return {
      status: 200,
      currentPage: query.page || 1,
      totalPages: totalPages,
      totalResults: total,
      blogs: data,
      meta: {
        hasNext: (query.page || 1) < totalPages,
        total: total,
        nextPage: (query.page || 1) < totalPages ? (query.page || 1) + 1 : null,
        prevPage: (query.page || 1) > 1 ? (query.page || 1) - 1 : null,
      },
    };
  }
}
