import { Module } from '@nestjs/common';
import RegistrationController from './auth.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '../user/entities/user.entity';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { appConfig } from '../../../config/appConfig';
import { Repository } from 'typeorm';
import AuthenticationService from './auth.service';
import UserService from '../user/user.service';


@Module({
  controllers: [RegistrationController],
  providers: [AuthenticationService, Repository, UserService],
  imports: [
    TypeOrmModule.forFeature([User]),
    PassportModule,
    JwtModule.register({
      global: true,
      secret: appConfig.jwt.jwtSecret,
      signOptions: { expiresIn: `${appConfig.jwt.jwtExpiry}s` },
    }),
  ],
})
export class AuthenticationModule { }
