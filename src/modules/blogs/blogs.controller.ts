import { Controller, Post, Body, UseGuards, Request, Get, Param, ParseUUIDPipe } from '@nestjs/common';
import { BlogService } from './blogs.service';
import { SuperAdminGuard } from '../../guards/super-admin.guard';
import { CreateBlogDto } from './dtos/create-blog.dto';
import { BlogResponseDto } from './dtos/blog-response.dto';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { BlogDto } from './dtos/blog.dto';

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

  @Get(':id')
  @ApiOperation({ summary: 'Get a single blog' })
  @ApiResponse({ status: 200, description: 'Blog fetched successfully.', type: BlogDto })
  @ApiResponse({ status: 404, description: 'Blog not found.' })
  async getSingleBlog(@Param('id', new ParseUUIDPipe()) id: string, @Request() req): Promise<BlogDto> {
    return await this.blogService.getSingleBlog(id, req.user);
  }
}
