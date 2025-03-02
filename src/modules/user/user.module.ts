import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import UserService from './user.service';
import { UserController } from './user.controller';
import { Role } from '@modules/role/entities/role.entity';
import { OrganisationUserRole } from '@modules/role/entities/organisation-user-role.entity';
import { Organisation } from '@modules/organisations/entities/organisations.entity';
import { Profile } from '@modules/profile/entities/profile.entity';
import { User } from './entities/user.entity';

@Module({
  controllers: [UserController],
  providers: [UserService, Repository],
  imports: [TypeOrmModule.forFeature([User, Profile, Organisation, OrganisationUserRole, Role])],
  exports: [UserService],
})
export class UserModule {}
