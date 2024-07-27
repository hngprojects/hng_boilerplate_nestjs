import { HttpException, HttpStatus, Injectable, NotFoundException } from '@nestjs/common';
import { CreateBlogDto } from '../dto/create-blog.dto';
import { ResponseDto } from '../dto/blog-response.dto';
import { BlogCategory } from '../entities/blog-category.entity';
import { User } from '../../../modules/user/entities/user.entity';
import { Blog } from '../entities/blog.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BlogMapper } from '../mappers/blog.mapper';
import { ApiResponse, ApiTags, ApiOperation, ApiBody } from '@nestjs/swagger';

@Injectable()
@ApiTags('blogs')
export class BlogService {
  constructor(
    @InjectRepository(Blog)
    private readonly blogRepository: Repository<Blog>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(BlogCategory)
    private readonly categoryRepository: Repository<BlogCategory>
  ) {}

  @ApiOperation({ summary: 'Create a new blog' })
  @ApiBody({ type: CreateBlogDto })
  @ApiResponse({ status: 201, description: 'Blog created successfully', type: ResponseDto })
  @ApiResponse({ status: 404, description: 'User or Category not found' })
  @ApiResponse({ status: 400, description: 'Error creating blog' })
  async create(createBlogDto: CreateBlogDto): Promise<ResponseDto> {
    const { authorId, categoryId, ...rest } = createBlogDto;

    const author = await this.userRepository.findOne({ where: { id: authorId } });
    if (!author) {
      throw new NotFoundException('User not found');
    }

    const category = await this.categoryRepository.findOne({ where: { id: categoryId } });
    if (!category) {
      throw new NotFoundException('Category not found');
    }

    try {
      const blog = this.blogRepository.create({ ...rest, author, category });
      await this.blogRepository.save(blog);

      const responseData = BlogMapper.toResponseDto(blog, author, category);

      return {
        status: 'success',
        message: 'Blog created successfully',
        status_code: HttpStatus.CREATED,
        data: responseData,
      };
    } catch (error) {
      throw new HttpException(
        {
          status: 'error',
          message: 'Error creating blog',
          status_code: HttpStatus.BAD_REQUEST,
        },
        HttpStatus.BAD_REQUEST
      );
    }
  }
}
