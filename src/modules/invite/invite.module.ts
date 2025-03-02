import { Module } from '@nestjs/common';
import { InviteService } from './invite.service';
import { InviteController } from './invite.controller';
import { Invite } from './entities/invite.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { Organisation } from '@modules/organisations/entities/organisations.entity';
import { User } from '@modules/user/entities/user.entity';
import { Profile } from '@modules/profile/entities/profile.entity';
import { Role } from '@modules/role/entities/role.entity';
import { OrganisationUserRole } from '@modules/role/entities/organisation-user-role.entity';
import { Permissions } from '@modules/permissions/entities/permissions.entity';
import UserService from '@modules/user/user.service';
import { OrganisationsService } from '@modules/organisations/organisations.service';
import QueueService from '@modules/email/queue.service';
import { EmailService } from '@modules/email/email.service';
import { BullModule } from '@nestjs/bull';

@Module({
  imports: [
    TypeOrmModule.forFeature([Invite, Organisation, User, Profile, Role, Permissions, OrganisationUserRole]),
    BullModule.registerQueue({
      name: 'emailSending',
    }),
    ConfigModule.forRoot({
      isGlobal: true,
    }),
  ],
  controllers: [InviteController],
  providers: [InviteService, EmailService, QueueService, OrganisationsService, UserService],
})
export class InviteModule {}
