import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BlogCategory } from './entities/blog-category.entity';
import { BlogCategoriesService } from './blog-categories.service';
import { SuperAdminGuard } from 'src/guards/super-admin.guard';
import { User } from '../user/entities/user.entity';
import { BlogCategoriesController } from './blog-categories.controller';

@Module({
  imports: [TypeOrmModule.forFeature([BlogCategory, User])],
  controllers: [BlogCategoriesController],
  providers: [BlogCategoriesService, SuperAdminGuard],
})
export class BlogCategoryModule {}
