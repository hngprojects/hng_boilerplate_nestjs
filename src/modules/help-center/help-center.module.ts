import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { HelpCenterService } from './help-center.service';
import { HelpCenterController } from './help-center.controller';
import { HelpCenterEntity } from './entities/help-center.entity';
import { User } from '@modules/user/entities/user.entity';
import { Organisation } from '@modules/organisations/entities/organisations.entity';
import { OrganisationUserRole } from '@modules/role/entities/organisation-user-role.entity';
import { Profile } from '@modules/profile/entities/profile.entity';
import { Role } from '@modules/role/entities/role.entity';
import { TextService } from '@modules/translation/translation.service';

@Module({
  imports: [TypeOrmModule.forFeature([HelpCenterEntity, User, Organisation, OrganisationUserRole, Profile, Role])],
  providers: [HelpCenterService, TextService],
  controllers: [HelpCenterController],
  exports: [HelpCenterService],
})
export class HelpCenterModule {}
