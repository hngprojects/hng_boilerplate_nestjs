import { Module } from '@nestjs/common';
import { OrganisationPermissionsService } from './organisation-permissions.service';
import { OrganisationPermissionsController } from './organisation-permissions.controller';
import { OrganisationRole } from '../organisation-role/entities/organisation-role.entity';
import { Organisation } from '../organisations/entities/organisations.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Permissions } from '../organisation-permissions/entities/permissions.entity';

@Module({
  providers: [OrganisationPermissionsService],
  controllers: [OrganisationPermissionsController],
  imports: [TypeOrmModule.forFeature([Organisation, OrganisationRole, Permissions])],
})
export class OrganisationPermissionsModule {}
