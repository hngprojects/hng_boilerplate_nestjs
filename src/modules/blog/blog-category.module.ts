import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BlogCategoryController } from './controllers/blog-category.controller';
import { BlogCategoryService } from './services/blog-category.service';
import { BlogCategory } from './entities/blog-category.entity';
import { Blog } from './entities/blog.entity';

@Module({
  imports: [TypeOrmModule.forFeature([BlogCategory, Blog])],
  controllers: [BlogCategoryController],
  providers: [BlogCategoryService],
})
export class BlogCategoryModule {}
