import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BlogController } from './blogs.controller';
import { BlogService } from './blogs.service';
import { Blog } from './entities/blog.entity';
import { User } from '../user/entities/user.entity';
import { Role } from '../role/entities/role.entity';
import { OrganisationUserRole } from '../role/entities/organisation-user-role.entity';
import { Organisation } from '../organisations/entities/organisations.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Blog, User, Organisation, OrganisationUserRole, Role])],
  controllers: [BlogController],
  providers: [BlogService],
})
export class BlogModule {}
