import { Module } from '@nestjs/common';
import { BlogCategoryService } from './blog-category.service';
import { BlogCategoryController } from './blog-category.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SuperAdminGuard } from '../../guards/super-admin.guard';
import { User } from '../user/entities/user.entity';
import { BlogCategory } from './entities/blog-category.entity';

@Module({
  imports: [TypeOrmModule.forFeature([BlogCategory, User])],
  controllers: [BlogCategoryController],
  providers: [BlogCategoryService, SuperAdminGuard],
})
export class BlogCategoryModule {}
