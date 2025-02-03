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
import { OtpModule } from '../otp/otp.module';
import { EmailModule } from '../email/email.module';
import { OtpService } from '../otp/otp.service';
import { EmailService } from '../email/email.service';
import { Otp } from '../otp/entities/otp.entity';
import { Profile } from '../profile/entities/profile.entity';
import { OrganisationsService } from '../organisations/organisations.service';
import { Organisation } from '../organisations/entities/organisations.entity';
import { OrganisationUserRole } from '../role/entities/organisation-user-role.entity';
import { Role } from '../role/entities/role.entity';
import { ProfileService } from '../profile/profile.service';

@Module({
  controllers: [RegistrationController],
  providers: [
    AuthenticationService,
    Repository,
    UserService,
    OtpService,
    EmailService,
    OrganisationsService,
    ProfileService,
  ],
  imports: [
    TypeOrmModule.forFeature([User, Otp, Profile, Organisation, OrganisationUserRole, Role]),
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
