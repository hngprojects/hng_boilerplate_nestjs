import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '../user/entities/user.entity';
import { Repository } from 'typeorm';
import UserService from './user.service';
import { UserController } from './user.controller';
import { Profile } from '../profile/entities/profile.entity';
import { Organisation } from '../organisations/entities/organisations.entity';
import { OrganisationUserRole } from '../role/entities/organisation-user-role.entity';
import { Role } from '../role/entities/role.entity';

@Module({
  controllers: [UserController],
  providers: [UserService, Repository],
  imports: [TypeOrmModule.forFeature([User, Profile, Organisation, OrganisationUserRole, Role])],
  exports: [UserService],
})
export class UserModule {}
