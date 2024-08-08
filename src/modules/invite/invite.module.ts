import { Module } from '@nestjs/common';
import { InviteService } from './invite.service';
import { InviteController } from './invite.controller';
import { Invite } from './entities/invite.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Organisation } from '../organisations/entities/organisations.entity';
import { User } from '../user/entities/user.entity';
import { Profile } from '../profile/entities/profile.entity';
import { OrganisationsService } from '../organisations/organisations.service';
// import { OrganisationRole } from '../organisation-role/entities/organisation-role.entity';
// import { DefaultRole } from '../organisation-role/entities/role.entity';
// import { DefaultPermissions } from '../organisation-permissions/entities/default-permissions.entity';
// import { Permissions } from '../organisation-permissions/entities/permissions.entity';
import UserService from '../user/user.service';
import { Role } from '../role/entities/role.entity';
import { Permissions } from '../permissions/entities/permissions.entity';
import { OrganisationUserRole } from '../role/entities/organisation-user-role.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Invite,
      Organisation,
      User,
      Profile,
      Role,
      Permissions,
      Permissions,
      OrganisationUserRole,
    ]),
  ],
  controllers: [InviteController],
  providers: [InviteService, OrganisationsService, UserService],
})
export class InviteModule {}
