import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../user/entities/user.entity';
import UserService from '../user/user.service';
import { Testimonial } from './entities/testimonials.entity';
import { TestimonialsController } from './testimonials.controller';
import { TestimonialsService } from './testimonials.service';
import { Profile } from '../profile/entities/profile.entity';
import { OrganisationsService } from '../organisations/organisations.service';
import { OrganisationRole } from '../organisation-role/entities/organisation-role.entity';
import { DefaultPermissions } from '../organisation-permissions/entities/default-permissions.entity';
import { Permissions } from '../organisation-permissions/entities/permissions.entity';
import { DefaultRole } from '../organisation-role/entities/role.entity';
import { OrganisationMember } from '../organisations/entities/org-members.entity';
import { Organisation } from '../organisations/entities/organisations.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Testimonial,
      User,
      Profile,
      Organisation,
      OrganisationMember,
      OrganisationRole,
      DefaultRole,
      DefaultPermissions,
      Permissions,
    ]),
  ],
  controllers: [TestimonialsController],
  providers: [TestimonialsService, Repository, UserService, OrganisationsService],
})
export class TestimonialsModule {}
