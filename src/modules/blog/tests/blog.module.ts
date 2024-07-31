import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PassportModule } from '@nestjs/passport';
import { Repository } from 'typeorm';
import { Blog } from '../entities/blog.entity';
import UserService from '../../user/user.service';
import { BlogPostCategory } from '../entities/blog-category.entity';
import { BlogPostComment } from '../entities/blog-comment.entity';
import { BlogService } from './blog.service';
import { BlogController } from './blog.controller';

@Module({
  controllers: [BlogController],
  providers: [BlogService, UserService, Repository],
  imports: [TypeOrmModule.forFeature([Blog, BlogPostCategory, BlogPostComment]), PassportModule],
})
export class BlogModule {}
