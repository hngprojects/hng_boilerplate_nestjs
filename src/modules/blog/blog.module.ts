import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PassportModule } from '@nestjs/passport';
import { Repository } from 'typeorm';
import { Blog } from './entities/blog.entity';
import UserService from '../user/user.service';
import { BlogCategory } from './entities/blog-category.entity';
import { BlogComment } from './entities/blog-comments.entity';
import { BlogService } from './services/blog.service';
import { BlogController } from './controllers/blog.controller';
import { User } from '../user/entities/user.entity';

@Module({
  controllers: [BlogController],
  providers: [BlogService, UserService, Repository],
  imports: [TypeOrmModule.forFeature([Blog, BlogCategory, User, BlogComment]), PassportModule],
})
export class BlogModule {}
