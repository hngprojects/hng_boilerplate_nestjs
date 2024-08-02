import {
  HttpException,
  HttpStatus,
  Injectable,
  Logger,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { CreateBlogPost } from './dto/create-blog.dto';
import { UpdateBlogDto } from './dto/update-blog.dto';
import { Blog } from './entities/blog.entity';
import { InjectRepository } from '@nestjs/typeorm';
import UserService from '../user/user.service';
import { Repository } from 'typeorm';
import { BlogPostCategory } from '../category/entities/category.entity';

@Injectable()
export class BlogService {
  private readonly logger = new Logger(BlogService.name);
  constructor(
    @InjectRepository(Blog) private readonly blogRepository: Repository<Blog>,
    @InjectRepository(Blog) private readonly categoryRepository: Repository<BlogPostCategory>,
    private readonly userService: UserService
  ) {}

  async create(createBlogPost: CreateBlogPost, userId: string): Promise<Blog> {
    try {
      const user = await this.userService.getUserRecord({ identifier: userId, identifierType: 'id' });
      if (!user) {
        throw new NotFoundException('User not found');
      }

      // if (!user.is_superuser) {
      //   throw new UnauthorizedException('Only super users can create blog posts');
      // }

      const category = await this.categoryRepository.findOne({ where: { id: createBlogPost.category_id } });
      if (!category) {
        throw new NotFoundException('Category not found');
      }

      const blog = this.blogRepository.create({
        ...createBlogPost,
        author: user,
        category_id: category,
        image_url: createBlogPost.image_url ? createBlogPost.image_url.join(',') : '',
      });
      await this.blogRepository.save(blog);

      this.logger.log(`Blog created successfully: ${JSON.stringify(blog)}`);

      return blog;
    } catch (error) {
      this.logger.error(`Error creating blog post: ${error.message}`);
      throw new HttpException(
        {
          status: 'error',
          message: 'Error creating blog post',
          status_code: HttpStatus.INTERNAL_SERVER_ERROR,
        },
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  // async userBlog(user) {
  //   const userInfo = await this.userService.getUserRecord(user);
  //   const getUserId = userInfo.id;
  //   const blogupdate = await this.blogRepository.find({
  //     where: {
  //       user: {
  //         id: getUserId,
  //       },
  //     },
  //     relations: {
  //       user: true,
  //     },
  //   });
  //   if (blogupdate.length === 0) {
  //     throw new NotFoundException('No data available for this user');
  //   }
  //   return blogupdate;
  // }

  async findAll(): Promise<Blog[]> {
    return this.blogRepository.find({ relations: ['user', 'category'] });
  }

  async getBlogById(id: string): Promise<Blog> {
    const blog = await this.blogRepository.findOne({ where: { id }, relations: ['user', 'category'] });
    if (!blog) {
      throw new NotFoundException('Blog not found');
    }
    return blog;
  }

  async updateBlogPost(id: string, updateBlogDto: UpdateBlogDto): Promise<Blog> {
    const blog = await this.blogRepository.findOne({ where: { id }, relations: ['user', 'category'] });
    if (!blog) {
      throw new NotFoundException('Blog not found');
    }

    if (updateBlogDto.category_id) {
      const category = await this.categoryRepository.findOne({ where: { id: updateBlogDto.category_id } });
      if (!category) {
        throw new NotFoundException('Category not found');
      }
      blog.category_id = category;
    }

    if (updateBlogDto.title) {
      blog.title = updateBlogDto.title;
    }

    if (updateBlogDto.content) {
      blog.content = updateBlogDto.content;
    }

    return await this.blogRepository.save(blog);
  }

  async deleteBlogPost(id: string): Promise<void> {
    const blog = await this.blogRepository.findOne({ where: { id } });
    if (!blog) {
      throw new NotFoundException('Blog not found');
    }

    try {
      await this.blogRepository.remove(blog);
    } catch (error) {
      throw new HttpException(
        {
          status: 'error',
          message: 'Error deleting blog post',
          status_code: HttpStatus.INTERNAL_SERVER_ERROR,
        },
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }
}
