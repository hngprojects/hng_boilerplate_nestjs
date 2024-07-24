import { Controller, Post, Body, HttpException, HttpStatus, UseGuards } from '@nestjs/common';
import { BlogService } from '../services/blog.service';
import { CreateBlogDto } from '../dto/create-blog.dto';
import { Blog } from '../entities/blog.entity';
import { AuthGuard } from '../../../guards/auth.guard';
@Controller('blogs')
export class BlogController {
  constructor(private readonly blogService: BlogService) {}

  @UseGuards(AuthGuard)
  @Post()
  async create(
    @Body() createBlogDto: CreateBlogDto
  ): Promise<{ status: string; message: string; status_code: number; data?: Blog }> {
    try {
      const blog = await this.blogService.create(createBlogDto);
      return {
        status: 'success',
        message: 'Blog created successfully',
        status_code: HttpStatus.CREATED,
        data: blog,
      };
    } catch (error) {
      throw new HttpException(
        {
          status: 'error',
          message: error.message || 'Error creating blog',
          status_code: HttpStatus.BAD_REQUEST,
        },
        HttpStatus.BAD_REQUEST
      );
    }
  }

  //Other blog method endpoint here
}
