import { Module } from '@nestjs/common';
import { WaitlistController } from './waitlist.controller';
import WaitlistService from './waitlist.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Waitlist } from './entities/waitlist.entity';
import { User } from '../user/entities/user.entity';
import { OrganisationUserRole } from '../role/entities/organisation-user-role.entity';
import { Organisation } from '../organisations/entities/organisations.entity';
import { Role } from '../role/entities/role.entity';

@Module({
  controllers: [WaitlistController],
  providers: [WaitlistService],
  imports: [TypeOrmModule.forFeature([Waitlist, User, OrganisationUserRole, Organisation, Role])],
})
export class WaitlistModule {}
