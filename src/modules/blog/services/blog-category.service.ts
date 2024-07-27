import { Injectable, BadRequestException, InternalServerErrorException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateBlogCategoryDto } from '../dto/create-blog-category.dto';
import { BlogCategory } from '../entities/blog-category.entity';
import { CategoryResponseDto } from '../dto/blog-category-response.dto';
import { ApiTags, ApiOperation, ApiBody, ApiResponse } from '@nestjs/swagger';

@Injectable()
@ApiTags('categories')
export class BlogCategoryService {
  constructor(
    @InjectRepository(BlogCategory)
    private readonly blogCategoryRepository: Repository<BlogCategory>
  ) {}

  @ApiOperation({ summary: 'Create a new blog category' })
  @ApiBody({ type: CreateBlogCategoryDto })
  @ApiResponse({ status: 201, description: 'Blog category created successfully.', type: CategoryResponseDto })
  @ApiResponse({ status: 400, description: 'Category name already exists.' })
  @ApiResponse({ status: 500, description: 'Failed to create category.' })
  async createCategory(createBlogCategoryDto: CreateBlogCategoryDto): Promise<CategoryResponseDto> {
    try {
      const { name } = createBlogCategoryDto;

      const existingCategory = await this.blogCategoryRepository.findOne({ where: { name } });
      if (existingCategory) {
        throw new BadRequestException({
          status: 'error',
          message: 'Category name already exists.',
          status_code: 400,
        });
      }

      const category = this.blogCategoryRepository.create({ name });

      const savedCategory = await this.blogCategoryRepository.save(category);
      return {
        status: 'success',
        message: 'Blog category created successfully.',
        data: { name: savedCategory.name },
        status_code: 201,
      };
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }

      throw new InternalServerErrorException({
        status: 'error',
        message: 'Failed to create category.',
        status_code: 500,
      });
    }
  }
}
