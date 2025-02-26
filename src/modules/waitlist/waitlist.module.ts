import { Module } from '@nestjs/common';
import { WaitlistController } from './waitlist.controller';
import WaitlistService from './waitlist.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Waitlist } from './entities/waitlist.entity';
import { Role } from '@modules/role/entities/role.entity';
import { Organisation } from '@modules/organisations/entities/organisations.entity';
import { OrganisationUserRole } from '@modules/role/entities/organisation-user-role.entity';
import { User } from '@modules/user/entities/user.entity';

@Module({
  controllers: [WaitlistController],
  providers: [WaitlistService],
  imports: [TypeOrmModule.forFeature([Waitlist, User, OrganisationUserRole, Organisation, Role])],
})
export class WaitlistModule {}
