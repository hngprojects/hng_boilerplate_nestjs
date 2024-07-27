import { Controller, Put, Param, Body, HttpException, HttpStatus, UseGuards } from '@nestjs/common';
import { BlogService } from '../services/blog.service';
import { EditBlogDto } from '../dto/edit-blog.dto';
import { Blog } from '../entities/blog.entity';
import { AuthGuard } from '../../../guards/auth.guard';
@Controller('blogs')
export class BlogController {
  constructor(private readonly blogService: BlogService) {}

  @UseGuards(AuthGuard)
  @Put('edit/:id')
  async editBlog(
    @Param('id') id: string,
    @Body() editBlogDto: EditBlogDto
  ): Promise<{
    status: string;
    message: string;
    status_code: number;
    data?: Blog;
  }> {
    try {
      const blog = await this.blogService.editBlog(id, editBlogDto);
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
