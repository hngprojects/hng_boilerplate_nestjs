import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { User } from './Models/user.entity';
import UserService from './Services/user.service';
import RegistrationController from './Controllers/SignUp/registration.controller';
import { Repository } from 'typeorm';
import HealthController from './Controllers/health.contoller';
import appConfig from '../../config/app/appConfig';

@Module({
  imports: [
    TypeOrmModule.forFeature([User]),
    PassportModule,
    JwtModule.register({
      secret: appConfig.jwt.jwtSecret,
      signOptions: { expiresIn: `${appConfig.jwt.jwtExpiry}s` },
    }),
  ],
  providers: [UserService, Repository],
  controllers: [RegistrationController, HealthController],
})
export class UserModule { }
