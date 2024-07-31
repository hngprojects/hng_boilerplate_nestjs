import { Module } from '@nestjs/common';
import { OrganisationsService } from './services/organisations.service';
import { OrganisationsController } from './controllers/organisations.controller';
import { OrganisationMembersService } from './services/org-members.service';
import { OrganisationMembersController } from './controllers/org-members.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Organisation } from './entities/organisations.entity';
import { OrganisationMember } from './entities/org-members.entity';
import { User } from '../user/entities/user.entity';
import { UserModule } from '../user/user.module';

@Module({
  imports: [TypeOrmModule.forFeature([Organisation, OrganisationMember, User]), UserModule],
  controllers: [OrganisationsController, OrganisationMembersController],
  providers: [OrganisationsService, OrganisationMembersService],
})
export class OrganisationsModule {}
