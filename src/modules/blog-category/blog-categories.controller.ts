import { Body, Controller, Post, UseGuards, Request } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { SuperAdminGuard } from 'src/guards/super-admin.guard';
import { BlogCategoriesService } from './blog-categories.service';
import { CreateBlogCategoryDto } from './dto/create-blog-category.dto';
import { User } from '../user/entities/user.entity';
import { AuthGuard } from 'src/guards/auth.guard';
import { Messages } from '../blog-category/common/constants';

@ApiTags('blog-categories')
@Controller('api/v1/blog-categories')
export class BlogCategoriesController {
  constructor(private readonly blogCategoriesService: BlogCategoriesService) {}

  @Post()
  @UseGuards(SuperAdminGuard, AuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create a new blog category' })
  @ApiResponse({ status: 201, description: Messages.BLOG_CATEGORY_CREATED_SUCCESS })
  @ApiResponse({ status: 400, description: Messages.INVALID_REQUEST_DATA })
  @ApiResponse({ status: 401, description: Messages.UNAUTHORIZED })
  @ApiResponse({ status: 403, description: Messages.FORBIDDEN })
  @ApiResponse({ status: 500, description: Messages.INTERNAL_SERVER_ERROR })
  async create(@Body() createBlogCategoryDto: CreateBlogCategoryDto, @Request() req: { user: User }) {
    const blogCategory = await this.blogCategoriesService.create(createBlogCategoryDto);
    return {
      status: 'success',
      message: Messages.BLOG_CATEGORY_CREATED_SUCCESS,
      data: blogCategory,
      status_code: 201,
    };
  }
}
