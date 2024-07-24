import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '../user/entities/user.entity';
import { Repository } from 'typeorm';
import { UserController } from './user.controller';
import UserService from './user.service';

@Module({
  controllers: [UserController],
  providers: [UserService, Repository],
  imports: [TypeOrmModule.forFeature([User])],
  exports: [UserService],
})
export class UserModule {}
