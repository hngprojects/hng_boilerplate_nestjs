import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '../user/entities/user.entity';
import { Repository } from 'typeorm';
import UserService from './user.service';
import { UserController } from './user.controller';
import { Profile } from '../profile/entities/profile.entity';

@Module({
  controllers: [UserController],
  providers: [UserService, Repository],
  imports: [TypeOrmModule.forFeature([User, Profile])],
  exports: [UserService],
})
export class UserModule {}
