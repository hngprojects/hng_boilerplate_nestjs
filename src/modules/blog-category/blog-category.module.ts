import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BlogCategory } from './entities/blog-category.entity';
import { User } from '@modules/user/entities/user.entity';
import { Organisation } from '@modules/organisations/entities/organisations.entity';
import { OrganisationUserRole } from '@modules/role/entities/organisation-user-role.entity';
import { Role } from '@modules/role/entities/role.entity';
import { BlogCategoryController } from './blog-category.controller';
import { BlogCategoryService } from './blog-category.service';
import { SuperAdminGuard } from '@guards/super-admin.guard';

@Module({
  imports: [TypeOrmModule.forFeature([BlogCategory, User, Organisation, OrganisationUserRole, Role])],
  controllers: [BlogCategoryController],
  providers: [BlogCategoryService, SuperAdminGuard],
})
export class BlogCategoryModule {}
