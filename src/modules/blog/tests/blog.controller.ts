import {
  Controller,
  Post,
  Put,
  Param,
  Body,
  HttpException,
  HttpStatus,
  UseGuards,
  Logger,
  Get,
  Delete,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiBody,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiParam,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { BlogService } from '../tests/blog.service';
import { CreateBlogPost } from '../dto/create-blog.dto';
import { EditBlogPost } from '../dto/edit-blog.dto';
import { Blog } from '../entities/blog.entity';

@ApiTags('blogs')
@Controller('api/v1/blogs')
export class BlogController {
  constructor(private readonly blogService: BlogService) {}

  @Post()
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth()
  @ApiBody({ type: CreateBlogPost })
  @ApiCreatedResponse({ description: 'The blog post has been successfully created.', type: Blog })
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  async createBlogPost(@Param('author') author: string, @Body() createBlogPost: CreateBlogPost) {
    await this.blogService.createBlogPost(author, createBlogPost);
  }

  @Get()
  @ApiOkResponse({ description: 'The list of blog posts.', type: Blog, isArray: true })
  async getAllBlogs(): Promise<Blog[]> {
    return this.blogService.getAllBlogs();
  }

  @Get(':id')
  @ApiParam({ name: 'id', description: 'The ID of the blog post.' })
  @ApiOkResponse({ description: 'The blog post.', type: Blog })
  async getBlogById(@Param('id') id: string): Promise<Blog> {
    return this.blogService.getBlogById(id);
  }

  @Put(':id')
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth()
  @ApiParam({ name: 'id', description: 'The ID of the blog post.' })
  @ApiBody({ type: EditBlogPost })
  @ApiOkResponse({ description: 'The blog post has been successfully updated.', type: Blog })
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  async editBlogPost(@Param('id') id: string, @Body() editBlogPostDto: EditBlogPost): Promise<Blog> {
    return this.blogService.editBlogPost(id, editBlogPostDto);
  }

  @Delete(':id')
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth()
  @ApiParam({ name: 'id', description: 'The ID of the blog post.' })
  @ApiOkResponse({ description: 'The blog post has been successfully deleted.' })
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  async deleteBlogPost(@Param('id') id: string): Promise<void> {
    return this.blogService.deleteBlogPost(id);
  }
}
