import { Module } from '@nestjs/common';
import { RoleService } from './role.service';
import { RoleController } from './role.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { OrganisationUserRole } from './entities/organisation-user-role.entity';
import { Organisation } from '../organisations/entities/organisations.entity';
import { DefaultPermissions } from '../permissions/entities/default-permissions.entity';
import { Permissions } from '../permissions/entities/permissions.entity';
import { Role } from './entities/role.entity';
import { User } from '../user/entities/user.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([OrganisationUserRole, Permissions, Organisation, DefaultPermissions, Role, User]),
  ],
  controllers: [RoleController],
  providers: [RoleService],
})
export class RoleModule {}
