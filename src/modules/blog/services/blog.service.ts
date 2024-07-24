import { HttpStatus, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ILike, Repository } from 'typeorm';
import { Blog } from '../entities/blog.entity';
import { CreateBlogDto } from '../dto/create-blog.dto';
import { User } from '../../user/entities/user.entity';
import { BlogCategory } from '../entities/blog-category.entity';

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

  async create(createBlogDto: CreateBlogDto): Promise<Blog> {
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
    return await this.blogRepository.save(blog);
  }

  async searchBlogs(query: string) {
    if (!query)
      return {
        status_code: HttpStatus.BAD_REQUEST,
        message: 'Query parameter is required!',
      };
    const blogs = await this.blogRepository.find({
      where: [{ title: ILike(`%${query}%`) }, { content: ILike(`%${query}%`) }],
      relations: ['author', 'comments', 'category', 'topic'],
    });

    if (blogs.length < 1)
      return {
        status_code: HttpStatus.OK,
        message: `No blogs found for ${query}`,
      };
    return {
      status_code: HttpStatus.OK,
      message: 'success',
      data: blogs,
    };
  }
  //Other blog service here
}
