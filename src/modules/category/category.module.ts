import { Module } from '@nestjs/common';
import { CategoryService } from './category.service';
import { CategoryController } from './category.controller';
import { BlogPostCategory } from './entities/category.entity';
import { Repository } from 'typeorm';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  imports: [TypeOrmModule.forFeature([BlogPostCategory])],
  controllers: [CategoryController],
  providers: [CategoryService],
})
export class CategoryModule {}
