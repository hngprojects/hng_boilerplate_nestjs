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
import { GoogleStrategy } from './strategies/google.strategy';
import { GoogleAuthService } from './google-auth.service';
import { Profile } from '../profile/entities/profile.entity';
import QueueService from '../email/queue.service';
import { OrganisationsService } from '../organisations/organisations.service';
import { Organisation } from '../organisations/entities/organisations.entity';
import { OrganisationMember } from '../organisations/entities/org-members.entity';
import { OrganisationRole } from '../organisation-role/entities/organisation-role.entity';
import { DefaultRole } from '../organisation-role/entities/role.entity';
import { DefaultPermissions } from '../organisation-permissions/entities/default-permissions.entity';
import { Permissions } from '../organisation-permissions/entities/permissions.entity';

@Module({
  controllers: [RegistrationController],
  providers: [
    AuthenticationService,
    Repository,
    UserService,
    OtpService,
    EmailService,
    GoogleStrategy,
    GoogleAuthService,
    OrganisationsService,
  ],
  imports: [
    TypeOrmModule.forFeature([
      User,
      Otp,
      Profile,
      Organisation,
      OrganisationMember,
      OrganisationRole,
      DefaultRole,
      DefaultPermissions,
      Permissions,
    ]),
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
