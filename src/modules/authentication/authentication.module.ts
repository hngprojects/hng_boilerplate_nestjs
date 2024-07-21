import { Module } from '@nestjs/common';
import RegistrationController from './registration.controller';
import UserService from './user.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { appConfig } from '../../../config/appConfig';
import { Repository } from 'typeorm';


@Module({
  controllers: [RegistrationController],
  providers: [UserService, Repository],
  imports: [
    TypeOrmModule.forFeature([User]),
    PassportModule,
    JwtModule.register({
      global: true,
      secret: appConfig.jwt.jwtSecret,
      signOptions: { expiresIn: `${appConfig.jwt.jwtExpiry}s` },
    }),
  ],
  exports: [UserService]
})
export class AuthenticationModule { }
