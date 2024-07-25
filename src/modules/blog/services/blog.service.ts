import { Injectable, NotFoundException, HttpException, HttpStatus } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Blog } from '../entities/blog.entity';
import { CreateBlogDto } from '../dto/create-blog.dto';
import { User } from '../../user/entities/user.entity';
import { BlogCategory } from '../entities/blog-category.entity';
import { ResponseDto } from '../dto/blog-response.dto';

@Injectable()
export class BlogService {
  constructor(
    @InjectRepository(Blog)
    private readonly blogRepository: Repository<Blog>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(BlogCategory)
    private readonly categoryRepository: Repository<BlogCategory>
  ) {}

  async create(createBlogDto: CreateBlogDto): Promise<ResponseDto> {
    try {
      const { authorId, categoryId, ...rest } = createBlogDto;

      const author = await this.userRepository.findOne({ where: { id: authorId } });
      if (!author) {
        throw new NotFoundException('User not found');
      }

      const category = await this.categoryRepository.findOne({ where: { id: categoryId } });
      if (!category) {
        throw new NotFoundException('Category not found');
      }

      const blog = this.blogRepository.create({ ...rest, author, category });
      await this.blogRepository.save(blog);

      return {
        status: 'success',
        message: 'Blog created successfully',
        status_code: HttpStatus.CREATED,
        data: blog,
      };
    } catch (error) {
      throw new HttpException(
        {
          status: 'error',
          message: error.message || 'Error creating blog',
          status_code: HttpStatus.BAD_REQUEST,
        },
        HttpStatus.BAD_REQUEST
      );
    }
  }
}
