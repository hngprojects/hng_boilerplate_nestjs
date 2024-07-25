import { Controller, Post, Body, HttpException, HttpStatus } from '@nestjs/common';
import { BlogService } from '../services/blog.service';
import { CreateBlogDto } from '../dto/create-blog.dto';
import { Blog } from '../entities/blog.entity';
import { ApiTags, ApiOperation, ApiResponse, ApiBody } from '@nestjs/swagger';
import { ResponseDto } from '../dto/blog-response.dto';

@ApiTags('blogs')
@Controller('/blogs')
export class BlogController {
  constructor(private readonly blogService: BlogService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new blog' })
  @ApiBody({ type: CreateBlogDto })
  @ApiResponse({ status: 201, description: 'Blog created successfully', type: Blog })
  @ApiResponse({ status: 500, description: 'Error creating blog' })
  async create(@Body() createBlogDto: CreateBlogDto): Promise<ResponseDto> {
    return this.blogService.create(createBlogDto);
  }
}
