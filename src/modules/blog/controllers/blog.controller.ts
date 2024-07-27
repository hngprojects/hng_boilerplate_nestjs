import { Controller, Post, Body, HttpException, HttpStatus } from '@nestjs/common';
import { BlogPostService } from '../services/blog.service';
import { CreateBlogDto } from '../dto/create-blog.dto';
import { BlogPost } from '../entities/blog.entity';
import { ApiTags, ApiOperation, ApiResponse, ApiBody } from '@nestjs/swagger';
import { BlogResponseDto } from '../dto/blog-response.dto';

@ApiTags('blogs')
@Controller('/blogs')
export class createBlogPostController {
  constructor(private readonly blogService: BlogPostService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new blog' })
  @ApiBody({ type: CreateBlogDto })
  @ApiResponse({ status: 201, description: 'Blog created successfully', type: BlogPost })
  @ApiResponse({ status: 500, description: 'Error creating blog' })
  async create(@Body() createBlogDto: CreateBlogDto): Promise<BlogResponseDto> {
    return this.blogService.create(createBlogDto);
  }
}
