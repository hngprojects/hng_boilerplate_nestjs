import { Module } from '@nestjs/common';
import { OrganisationPermissionsService } from './permissions.service';
import { OrganisationPermissionsController } from './permissions.controller';
import { Organisation } from '../organisations/entities/organisations.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Permissions } from './entities/permissions.entity';
import { Role } from '../role/entities/role.entity';
import { OrganisationUserRole } from '../role/entities/organisation-user-role.entity';

@Module({
  providers: [OrganisationPermissionsService],
  controllers: [OrganisationPermissionsController],
  imports: [TypeOrmModule.forFeature([Organisation, OrganisationUserRole, Permissions, Role])],
})
export class OrganisationPermissionsModule {}
