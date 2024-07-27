import { Controller, Put, Param, Body, HttpException, HttpStatus, UseGuards } from '@nestjs/common';
import { BlogPostService } from '../services/blog.service';
import { EditBlogPost } from '../dto/edit-blog.dto';
import { Blog } from '../entities/blog.entity';
@Controller('blogs')
export class BlogController {
  constructor(private readonly blogService: BlogPostService) {}

  @Put('edit/:id')
  async editBlogPost(
    @Param('id') id: string,
    @Body() editBlogDto: EditBlogPost
  ): Promise<{
    status: string;
    message: string;
    status_code: number;
    data?: Blog;
  }> {
    try {
      const blog = await this.blogService.editBlogPost(id, editBlogDto);
      return {
        status: 'success',
        message: 'Blog updated successfully',
        status_code: HttpStatus.OK,
        data: blog,
      };
    } catch (error) {
      throw new HttpException(
        {
          status: 'error',
          message: error.message || 'Error updating blog',
          status_code: HttpStatus.BAD_REQUEST,
        },
        HttpStatus.BAD_REQUEST
      );
    }
  }
}
