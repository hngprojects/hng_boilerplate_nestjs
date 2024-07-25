import { Controller, Post, Body, HttpException, HttpStatus, UseGuards, Get, Query } from '@nestjs/common';
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

  // @UseGuards(AuthGuard)
  // @Get('latest')
  // async fetchLatestBlogs(
  //   @Query('page') page = 1,
  //   @Query('page_size') pageSize = 10
  // ): Promise<{ count: number; next: string | null; previous: string | null; results: any[] }> {
  //   try {
  //     page = Math.max(1, Number(page) || 1);
  //     pageSize = Math.max(1, Number(pageSize) || 10);

  //     const { blogs, count } = await this.blogService.fetchLatestBlogs(page, pageSize);

  //     const baseUrl = 'http://example.com/api/v1/blogs/latest';
  //     const next = page * pageSize < count ? `${baseUrl}?page=${page + 1}&page_size=${pageSize}` : null;
  //     const previous = page > 1 ? `${baseUrl}?page=${page - 1}&page_size=${pageSize}` : null;

  //     const results = blogs.map(blog => ({
  //       title: blog.title,
  //       excerpt: blog.content.substring(0, 100),
  //       publish_date: blog.created_at,
  //       author: `${blog.author.first_name} ${blog.author.last_name}`,
  //     }));

  //     return {
  //       count,
  //       next,
  //       previous,
  //       results,
  //     };
  //   } catch (error) {
  //     throw new HttpException(
  //       {
  //         status: 'error',
  //         message: error.message || 'Error fetching latest blogs',
  //         status_code: HttpStatus.INTERNAL_SERVER_ERROR,
  //       },
  //       HttpStatus.INTERNAL_SERVER_ERROR
  //     );
  //   }
  // }
  //Other blog method endpoint here
}
