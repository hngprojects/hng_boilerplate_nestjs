import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PassportModule } from '@nestjs/passport';
import { Repository } from 'typeorm';
import { Blog } from '../entities/blog.entity';
import UserService from '../../user/user.service';
import { BlogPostCategory } from '../entities/blog-category.entity';
import { BlogPostComment } from '../entities/blog-comment.entity';
import { BlogPostService } from '../services/blog.service';
import { BlogController } from '../controllers/blog.controller';

@Module({
  controllers: [BlogController],
  providers: [BlogPostService, UserService, Repository],
  imports: [TypeOrmModule.forFeature([Blog, BlogPostCategory, BlogPostComment]), PassportModule],
})
export class BlogModule {}
