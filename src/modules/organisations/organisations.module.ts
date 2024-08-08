import { Module } from '@nestjs/common';
import { OrganisationsService } from './organisations.service';
import { OrganisationsController } from './organisations.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Organisation } from './entities/organisations.entity';
import { User } from '../user/entities/user.entity';
import { UserModule } from '../user/user.module';
import { OrganisationUserRole } from '../role/entities/organisation-user-role.entity';
import { Role } from '../role/entities/role.entity';
import UserService from '../user/user.service';
import { InviteModule } from '../invite/invite.module';
import { Permissions } from '../permissions/entities/permissions.entity';
import { Profile } from '../profile/entities/profile.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Organisation,
      User,
      OrganisationUserRole,
      Role,
      Organisation,
      User,
      Permissions,
      Profile,
    ]),
    UserModule,
    InviteModule,
  ],
  controllers: [OrganisationsController],
  providers: [OrganisationsService, UserService],
})
export class OrganisationsModule {}
