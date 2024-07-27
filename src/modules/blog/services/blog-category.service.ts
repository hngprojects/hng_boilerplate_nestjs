import { Injectable, BadRequestException, InternalServerErrorException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateBlogCategoryDto } from '../dto/create-blog-category.dto';
import { createBlogPostCategory } from '../entities/blog-category.entity';
import { CategoryResponseDto } from '../dto/blog-category-response.dto';
import { ApiTags, ApiOperation, ApiBody, ApiResponse } from '@nestjs/swagger';
import { BLOG_POST } from '../../../helpers/SystemMessages';

@Injectable()
@ApiTags('categories')
export class BlogPostCategoryService {
  constructor(
    @InjectRepository(createBlogPostCategory)
    private readonly blogCategoryRepository: Repository<createBlogPostCategory>
  ) {}

  @ApiOperation({ summary: 'Create a new blog category' })
  @ApiBody({ type: CreateBlogCategoryDto })
  @ApiResponse({ status: 201, description: BLOG_POST.CATEGORY_CREATED_SUCCESS, type: CategoryResponseDto })
  @ApiResponse({ status: 400, description: BLOG_POST.CATEGORY_NAME_EXISTS })
  @ApiResponse({ status: 500, description: BLOG_POST.CATEGORY_CREATION_ERROR })
  async createCategory(createBlogCategoryDto: CreateBlogCategoryDto): Promise<CategoryResponseDto> {
    try {
      const { name } = createBlogCategoryDto;

      const existingCategory = await this.blogCategoryRepository.findOne({ where: { name } });
      if (existingCategory) {
        throw new BadRequestException({
          status: 'error',
          message: BLOG_POST.CATEGORY_NAME_EXISTS,
          status_code: 400,
        });
      }

      const category = this.blogCategoryRepository.create({ name });

      const savedCategory = await this.blogCategoryRepository.save(category);
      return {
        status: 'success',
        message: BLOG_POST.CATEGORY_CREATED_SUCCESS,
        data: { name: savedCategory.name },
        status_code: 201,
      };
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }

      throw new InternalServerErrorException({
        status: 'error',
        message: BLOG_POST.CATEGORY_CREATION_ERROR,
        status_code: 500,
      });
    }
  }
}
