import { HttpException, HttpStatus, Injectable, NotFoundException } from '@nestjs/common';
import { CreateBlogDto } from '../dto/create-blog.dto';
import { BlogResponseDto } from '../dto/blog-response.dto';
import { createBlogPostCategory } from '../entities/blog-category.entity';
import { User } from '../../../modules/user/entities/user.entity';
import { BlogPost } from '../entities/blog.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BlogMapper } from '../mappers/blog.mapper';
import { ApiResponse, ApiTags, ApiOperation, ApiBody } from '@nestjs/swagger';
import { BLOG_POST } from '../../../helpers/SystemMessages';

@Injectable()
@ApiTags('blogs')
export class BlogPostService {
  constructor(
    @InjectRepository(BlogPost)
    private readonly blogRepository: Repository<BlogPost>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(createBlogPostCategory)
    private readonly categoryRepository: Repository<createBlogPostCategory>
  ) {}

  @ApiOperation({ summary: 'Create a new blog' })
  @ApiBody({ type: CreateBlogDto })
  @ApiResponse({ status: 201, description: BLOG_POST.BLOG_CREATED_SUCCESS, type: BlogResponseDto })
  @ApiResponse({ status: 404, description: BLOG_POST.USER_NOT_FOUND })
  @ApiResponse({ status: 404, description: BLOG_POST.CATEGORY_NOT_FOUND })
  @ApiResponse({ status: 400, description: BLOG_POST.BLOG_CREATION_ERROR })
  async create(createBlogDto: CreateBlogDto): Promise<BlogResponseDto> {
    const { authorId, categoryId, ...rest } = createBlogDto;

    const author = await this.userRepository.findOne({ where: { id: authorId } });
    if (!author) {
      throw new NotFoundException(BLOG_POST.USER_NOT_FOUND);
    }

    const category = await this.categoryRepository.findOne({ where: { id: categoryId } });
    if (!category) {
      throw new NotFoundException(BLOG_POST.CATEGORY_NOT_FOUND);
    }

    try {
      const blog = this.blogRepository.create({ ...rest, author, category });
      await this.blogRepository.save(blog);

      const responseData = BlogMapper.toResponseDto(blog, author, category);

      return {
        status: 'success',
        message: BLOG_POST.BLOG_CREATED_SUCCESS,
        status_code: HttpStatus.CREATED,
        data: responseData,
      };
    } catch (error) {
      throw new HttpException(
        {
          status: 'error',
          message: BLOG_POST.BLOG_CREATION_ERROR,
          status_code: HttpStatus.BAD_REQUEST,
        },
        HttpStatus.BAD_REQUEST
      );
    }
  }
}
