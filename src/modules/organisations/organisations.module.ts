import { Module } from '@nestjs/common';
import { OrganisationsService } from './organisations.service';
import { OrganisationsController } from './organisations.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Organisation } from './entities/organisations.entity';
import { User } from '../user/entities/user.entity';
import { UserModule } from '../user/user.module';
import { OrganisationMember } from './entities/org-members.entity';
import { OrganisationRole } from '../organisation-role/entities/organisation-role.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Organisation, User, OrganisationMember, OrganisationRole]), UserModule],
  controllers: [OrganisationsController],
  providers: [OrganisationsService],
})
export class OrganisationsModule {}
