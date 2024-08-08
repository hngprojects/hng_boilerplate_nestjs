import { Module } from '@nestjs/common';
import { BlogCategoryService } from './blog-category.service';
import { BlogCategoryController } from './blog-category.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SuperAdminGuard } from '../../guards/super-admin.guard';
import { User } from '../user/entities/user.entity';
import { BlogCategory } from './entities/blog-category.entity';
import { Organisation } from '../organisations/entities/organisations.entity';
import { OrganisationUserRole } from '../role/entities/organisation-user-role.entity';
import { Role } from '../role/entities/role.entity';

@Module({
  imports: [TypeOrmModule.forFeature([BlogCategory, User, Organisation, OrganisationUserRole, Role])],
  controllers: [BlogCategoryController],
  providers: [BlogCategoryService, SuperAdminGuard],
})
export class BlogCategoryModule {}
