import { Controller, Post, Body, HttpException, HttpStatus } from '@nestjs/common';
import { BlogService } from '../services/blog.service';
import { CreateBlogDto } from '../dto/create-blog.dto';
import { Blog } from '../entities/blog.entity';

@Controller('api/v1/blogs')
export class BlogController {
  constructor(private readonly blogService: BlogService) {}

  @Post()
  async create(
    @Body() createBlogDto: CreateBlogDto
  ): Promise<{ status: string; message: string; statusCode: number; data?: Blog }> {
    try {
      const blog = await this.blogService.create(createBlogDto);
      return {
        status: 'success',
        message: 'Blog created successfully',
        statusCode: HttpStatus.CREATED,
        data: blog,
      };
    } catch (error) {
      throw new HttpException(
        {
          status: 'error',
          message: error.message || 'Error creating blog',
          statusCode: HttpStatus.BAD_REQUEST,
        },
        HttpStatus.BAD_REQUEST
      );
    }
  }

  //Other blog method endpoint here
}
