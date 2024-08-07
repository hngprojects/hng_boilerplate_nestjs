import { Controller, Post, Body, UseGuards, Request, Get, Query, Param, Put } from '@nestjs/common';
import { BlogService } from './blogs.service';
import { SuperAdminGuard } from '../../guards/super-admin.guard';
import { CreateBlogDto } from './dtos/create-blog.dto';
import { BlogResponseDto } from './dtos/blog-response.dto';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { skipAuth } from 'src/helpers/skipAuth';
import { UpdateBlogDto } from './dtos/update-blog.dto';
import { UpdateBlogResponseDto } from './dtos/update-blog-response.dto';

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
    return this.blogService.createBlog(createBlogDto, req.user);
  }

  @Put(':id')
  @UseGuards(SuperAdminGuard)
  @ApiOperation({ summary: 'Update a blog post by ID' })
  @ApiResponse({ status: 200, description: 'Blog post updated successfully.', type: UpdateBlogResponseDto })
  @ApiResponse({ status: 404, description: 'Blog post not found.' })
  @ApiResponse({ status: 500, description: 'Internal server error.' })
  async updateBlog(
    @Param('id') id: string,
    @Body() updateBlogDto: UpdateBlogDto,
    @Request() req
  ): Promise<UpdateBlogResponseDto> {
    const updatedBlog = await this.blogService.updateBlog(id, updateBlogDto, req.user);

    return {
      message: 'Blog post updated successfully',
      post: updatedBlog,
    };
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
