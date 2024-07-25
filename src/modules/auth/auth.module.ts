import { Module } from '@nestjs/common';
import RegistrationController from './auth.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '../user/entities/user.entity';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import appConfig from '../../../config/auth.config';
import { Repository } from 'typeorm';
import AuthenticationService from './auth.service';
import UserService from '../user/user.service';
import { EmailModule } from '../email/email.module';
import { EmailService } from '../email/email.service';
import { Otp } from '../otp/entities/otp.entity';
import OtpService from '../otp/otp.service';
import { OtpModule } from '../otp/otp.module';

@Module({
  controllers: [RegistrationController],
  providers: [AuthenticationService, Repository, UserService, OtpService, EmailService],
  imports: [
    TypeOrmModule.forFeature([User, Otp]),
    PassportModule,
    OtpModule,
    EmailModule,
    JwtModule.register({
      global: true,
      secret: appConfig().jwtSecret,
      signOptions: { expiresIn: `${appConfig().jwtExpiry}s` },
    }),
  ],
})
export class AuthModule {}
