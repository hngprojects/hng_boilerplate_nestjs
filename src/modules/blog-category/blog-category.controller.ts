import { Body, Controller, Post, UseGuards, Request } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { SuperAdminGuard } from '../../guards/super-admin.guard';
import { BlogCategoryService } from './blog-category.service';
import { CreateBlogCategoryDto } from './dto/create-blog-category.dto';
import { User } from '../user/entities/user.entity';
import { AuthGuard } from '../../guards/auth.guard';

@ApiTags('Blog Categories')
@Controller('blogs/categories')
export class BlogCategoryController {
  constructor(private readonly blogCategoryService: BlogCategoryService) {}

  @Post()
  @UseGuards(SuperAdminGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create a new blog category' })
  @ApiResponse({ status: 201, description: 'Blog category created successfully.' })
  @ApiResponse({ status: 400, description: 'Invalid request data. Please provide a valid category name.' })
  @ApiResponse({ status: 401, description: 'Unauthorized. Token is missing or invalid.' })
  @ApiResponse({ status: 403, description: 'Forbidden. You do not have permission to create blog categories.' })
  @ApiResponse({ status: 500, description: 'Internal Server Error. Please try again later.' })
  async create(@Body() createBlogCategoryDto: CreateBlogCategoryDto) {
    return await this.blogCategoryService.createOrganisationCategory(createBlogCategoryDto);
  }
}
