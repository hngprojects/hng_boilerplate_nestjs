import { Module } from '@nestjs/common';
import { RoleService } from './role.service';
import { RoleController } from './role.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { OrganisationUserRole } from './entities/organisation-user-role.entity';
import { Role } from './entities/role.entity';
import { User } from '@modules/user/entities/user.entity';
import { DefaultPermissions } from '@modules/permissions/entities/default-permissions.entity';
import { Organisation } from '@modules/organisations/entities/organisations.entity';
import { Permissions } from '@modules/permissions/entities/permissions.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([OrganisationUserRole, Permissions, Organisation, DefaultPermissions, Role, User]),
  ],
  controllers: [RoleController],
  providers: [RoleService],
})
export class RoleModule {}
