import { Controller, Put, Param, Body, UseGuards, Request } from '@nestjs/common';
import { BlogService } from './blog.service';
import { UpdateBlogDto } from './dto/update-blog.dto';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';

@Controller('api/v1/blog')
export class BlogController {
  constructor(private readonly blogService: BlogService) {}

  @Put('edit/:blog_id')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('superadmin')
  async editBlog(
    @Param('blog_id') blogId: number,
    @Body() updateBlogDto: UpdateBlogDto,
    @Request() req,
  ) {
    const isAdmin = req.user.role === 'superadmin';
    const updatedBlog = await this.blogService.updateBlog(blogId, updateBlogDto, isAdmin);
    return {
      message: 'Blog successfully updated',
      id: updatedBlog.id,
      title: updatedBlog.title,
      excerpt: updatedBlog.excerpt,
      updated_at: updatedBlog.updated_at,
    };
  }
}
