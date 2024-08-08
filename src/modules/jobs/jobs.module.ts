import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '../user/entities/user.entity';
import { UserModule } from '../user/user.module';
import { JobApplication } from './entities/job-application.entity';
import { Job } from './entities/job.entity';
import { JobsController } from './jobs.controller';
import { JobsService } from './jobs.service';
import { Role } from '../role/entities/role.entity';
import { Profile } from '../profile/entities/profile.entity';
import { OrganisationUserRole } from '../role/entities/organisation-user-role.entity';
import { Organisation } from '../organisations/entities/organisations.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Job, User, JobApplication, Organisation, OrganisationUserRole, Profile, Role]),
    UserModule,
  ],
  providers: [JobsService],
  controllers: [JobsController],
})
export class JobsModule {}
