import { Controller, Post, Body, UseGuards, Req, HttpStatus, HttpException } from '@nestjs/common';
import { BlogsService } from './blogs.service';
import { CreateBlogDto } from './dto/create-blog.dto';

@Controller('blogs')
export class BlogsController {
  constructor(private readonly blogsService: BlogsService) {}

  @Post()
  async create(@Body() createBlogDto: CreateBlogDto, @Req() req) {
    try {
      const blog = await this.blogsService.create(createBlogDto);
      return {
        status_code: HttpStatus.CREATED,
        message: 'Blog post created successfully',
        data: {
          blog_id: blog.id,
          title: blog.title,
          content: blog.content,
          image_urls: blog.image_urls,
          tags: blog.tags,
          author: blog.author,
          created_at: blog.createdAt,
        },
      };
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException('Internal server error', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
}
