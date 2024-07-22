import { Module } from '@nestjs/common';
import { BlogsService } from './blogs.service';
import { BlogsController } from './blogs.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Blog } from './entities/blog.entity';
import { BlogCategory } from 'src/database/entities/blogs-categories.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Blog, BlogCategory])],
  controllers: [BlogsController],
  providers: [BlogsService],
})
export class BlogsModule {}
