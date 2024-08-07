import { Controller, Post, Body, UseGuards, Request, Delete, Param, HttpCode, HttpStatus } from '@nestjs/common';
import { BlogService } from './blogs.service';
import { SuperAdminGuard } from '../../guards/super-admin.guard';
import { CreateBlogDto } from './dtos/create-blog.dto';
import { BlogResponseDto } from './dtos/blog-response.dto';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';

@ApiTags('blogs')
@Controller('/blogs')
export class BlogController {
  constructor(private readonly blogService: BlogService) {}

  @Post()
  @UseGuards(SuperAdminGuard)
  @ApiOperation({ summary: 'Create a new blog' })
  @ApiResponse({ status: 201, description: 'The blog has been successfully created.', type: BlogResponseDto })
  @ApiResponse({ status: 403, description: 'Forbidden.' })
  async createBlog(@Body() createBlogDto: CreateBlogDto, @Request() req): Promise<any> {
    return await this.blogService.createBlog(createBlogDto, req.user);
  }
  @Delete(':id')
  @UseGuards(SuperAdminGuard)
  @HttpCode(HttpStatus.ACCEPTED)
  @ApiOperation({ summary: 'Delete a blog post' })
  @ApiResponse({ status: 202, description: 'Blog successfully deleted.' })
  @ApiResponse({ status: 404, description: 'Blog with the given Id does not exist.' })
  @ApiResponse({ status: 403, description: 'You are not authorized to perform this action.' })
  @ApiResponse({ status: 500, description: 'Internal server error.' })
  async deleteBlog(@Param('id') id: string): Promise<any> {
    await this.blogService.deleteBlogPost(id);
    return {
      message: 'Blog successfully deleted',
      status_code: HttpStatus.ACCEPTED,
    };
  }
}
