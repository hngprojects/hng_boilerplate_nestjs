import { Controller, Post, Body, UseGuards, Request } from '@nestjs/common';
import { BlogCategoryService } from './blog-category.service';
import { CreateBlogCategoryDto } from './create-blog-category.dto';

// import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
// import { RolesGuard } from '../../auth/guards/roles.guard';
// import { Roles } from '../../auth/decorators/roles.decorator';
// import { Role } from '../../auth/role.enum';

@Controller('api/v1/blog-categories')
export class BlogCategoryController {
  constructor(private readonly blogCategoryService: BlogCategoryService) {}

  @Post()
  //   @UseGuards(JwtAuthGuard, RolesGuard)
  //   @Roles(Role.SuperAdmin)
  async createCategory(@Body() createBlogCategoryDto: CreateBlogCategoryDto) {
    return this.blogCategoryService.createCategory(createBlogCategoryDto);
  }
}
