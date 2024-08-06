import { Body, Controller, Post, UseGuards, Request } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { SuperAdminGuard } from 'src/guards/super-admin.guard';
import { BlogCategoriesService } from './blog-categories.service';
import { CreateBlogCategoryDto } from './dto/create-blog-category.dto';
import { User } from '../user/entities/user.entity';
import { AuthGuard } from 'src/guards/auth.guard';

@ApiTags('blog-categories')
@Controller('api/v1/blog-categories')
export class BlogCategoriesController {
  constructor(private readonly blogCategoriesService: BlogCategoriesService) {}

  @Post()
  @UseGuards(SuperAdminGuard, AuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create a new blog category' })
  @ApiResponse({ status: 201, description: 'Blog category created successfully.' })
  @ApiResponse({ status: 400, description: 'Invalid request data. Please provide a valid category name.' })
  @ApiResponse({ status: 401, description: 'Unauthorized. Token is missing or invalid.' })
  @ApiResponse({ status: 403, description: 'Forbidden. You do not have permission to create blog categories.' })
  @ApiResponse({ status: 500, description: 'Internal Server Error. Please try again later.' })
  async create(@Body() createBlogCategoryDto: CreateBlogCategoryDto, @Request() req: { user: User }) {
    const blogCategory = await this.blogCategoriesService.create(createBlogCategoryDto);
    return {
      status: 'success',
      message: 'Blog category created successfully.',
      data: blogCategory,
      status_code: 201,
    };
  }
}
