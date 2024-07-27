import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PassportModule } from '@nestjs/passport';
import { Repository } from 'typeorm';
import UserService from '../user/user.service';
import { BlogPostService } from './services/blog.service';
import { createBlogPostController } from './controllers/blog.controller';
import { User } from '../user/entities/user.entity';
import { BlogPost } from './entities/blog.entity';
import { createBlogPostCategory } from './entities/blog-category.entity';
import { BlogPostComment } from './entities/blog-comments.entity';

@Module({
  controllers: [createBlogPostController],
  providers: [BlogPostService, UserService, Repository],
  imports: [TypeOrmModule.forFeature([BlogPost, createBlogPostCategory, BlogPostComment, User]), PassportModule],
})
export class BlogModule {}
