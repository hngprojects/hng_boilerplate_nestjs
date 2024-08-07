import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '../user/entities/user.entity';
import { Repository } from 'typeorm';
import UserService from './user.service';
import { UserController } from './user.controller';
import { Profile } from '../profile/entities/profile.entity';
import { OrganisationsService } from '../organisations/organisations.service';
import { Organisation } from '../organisations/entities/organisations.entity';
import { OrganisationMember } from '../organisations/entities/org-members.entity';
import { OrganisationRole } from '../organisation-role/entities/organisation-role.entity';
import { DefaultPermissions } from '../organisation-permissions/entities/default-permissions.entity';
import { Permissions } from '../organisation-permissions/entities/permissions.entity';
import { DefaultRole } from '../organisation-role/entities/role.entity';

@Module({
  controllers: [UserController],
  providers: [UserService, Repository, OrganisationsService],
  imports: [
    TypeOrmModule.forFeature([
      User,
      Profile,
      Organisation,
      OrganisationMember,
      OrganisationRole,
      DefaultRole,
      DefaultPermissions,
      Permissions,
    ]),
  ],
  exports: [UserService],
})
export class UserModule {}
