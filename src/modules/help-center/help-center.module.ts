import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { HelpCenterService } from './help-center.service';
import { HelpCenterController } from './help-center.controller';
import { HelpCenterEntity } from './entities/help-center.entity';
import { User } from '../user/entities/user.entity';
import { Role } from '../role/entities/role.entity';
import { Profile } from '../profile/entities/profile.entity';
import { OrganisationUserRole } from '../role/entities/organisation-user-role.entity';
import { Organisation } from '../organisations/entities/organisations.entity';

@Module({
  imports: [TypeOrmModule.forFeature([HelpCenterEntity, User, Organisation, OrganisationUserRole, Profile, Role])],
  providers: [HelpCenterService],
  controllers: [HelpCenterController],
  exports: [HelpCenterService],
})
export class HelpCenterModule {}
