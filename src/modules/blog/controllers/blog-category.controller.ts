import { Controller, Post, Body, UseGuards, Request } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiBody } from '@nestjs/swagger';
import { CreateBlogCategoryDto } from '../dto/create-blog-category.dto';
import { BlogCategoryService } from '../services/blog-category.service';

@ApiTags('blog-categories')
@ApiBearerAuth()
@Controller('/blog-categories')
export class BlogCategoryController {
  constructor(private readonly blogCategoryService: BlogCategoryService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new blog category' })
  @ApiResponse({ status: 201, description: 'Blog category created successfully.' })
  @ApiResponse({ status: 400, description: 'Category name already exists.' })
  @ApiResponse({ status: 500, description: 'Failed to create category.' })
  @ApiBody({
    description: 'Create blog category payload',
    type: CreateBlogCategoryDto,
    schema: { example: { name: 'Technology' } },
  })
  async createCategory(@Body() createBlogCategoryDto: CreateBlogCategoryDto) {
    return this.blogCategoryService.createCategory(createBlogCategoryDto);
  }
}
