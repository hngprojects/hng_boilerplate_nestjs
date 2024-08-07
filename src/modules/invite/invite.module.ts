import { Module } from '@nestjs/common';
import { InviteService } from './invite.service';
import { InviteController } from './invite.controller';
import { Invite } from './entities/invite.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Organisation } from '../organisations/entities/organisations.entity';
import { User } from '../user/entities/user.entity';
import { OrganisationMember } from '../organisations/entities/org-members.entity';
import { OrganisationsService } from '../organisations/organisations.service';
import { OrganisationRole } from '../organisation-role/entities/organisation-role.entity';
import { DefaultRole } from '../organisation-role/entities/role.entity';
import { DefaultPermissions } from '../organisation-permissions/entities/default-permissions.entity';
import { Permissions } from '../organisation-permissions/entities/permissions.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Invite,
      Organisation,
      User,
      OrganisationMember,
      OrganisationRole,
      DefaultRole,
      DefaultPermissions,
      Permissions,
    ]),
  ],
  controllers: [InviteController],
  providers: [InviteService, OrganisationsService],
})
export class InviteModule {}
