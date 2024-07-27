import { Controller, Post, Body, UseGuards, Request } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiBody } from '@nestjs/swagger';
import { CreateBlogCategoryDto } from '../dto/create-blog-category.dto';
import { BlogPostCategoryService } from '../services/blog-category.service';
import { CategoryResponseDto } from '../dto/blog-category-response.dto';

@ApiTags('blog-categories')
@ApiBearerAuth()
@Controller('/blog-categories')
export class BlogPostCategoryController {
  constructor(private readonly blogCategoryService: BlogPostCategoryService) {}

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
  async createCategory(@Body() createBlogCategoryDto: CreateBlogCategoryDto): Promise<CategoryResponseDto> {
    return this.blogCategoryService.createCategory(createBlogCategoryDto);
  }
}
