import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JobApplication } from './entities/job-application.entity';
import { Job } from './entities/job.entity';
import { JobsController } from './jobs.controller';
import { JobsService } from './jobs.service';
import { User } from '@modules/user/entities/user.entity';
import { Organisation } from '@modules/organisations/entities/organisations.entity';
import { OrganisationUserRole } from '@modules/role/entities/organisation-user-role.entity';
import { Profile } from '@modules/profile/entities/profile.entity';
import { Role } from '@modules/role/entities/role.entity';
import { UserModule } from '@modules/user/user.module';
import { AuthGuard } from '@guards/auth.guard';
import { JobAccessGuard } from '@guards/job-access.guard';
import { S3Service } from '@modules/s3/s3.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([Job, User, JobApplication, Organisation, OrganisationUserRole, Profile, Role]),
    UserModule,
  ],
  providers: [JobsService, JobAccessGuard, AuthGuard, S3Service],
  controllers: [JobsController],
})
export class JobsModule {}
