import { Module } from '@nestjs/common';
import { OrganisationPermissionsService } from './organisation-permissions.service';
import { OrganisationPermissionsController } from './organisation-permissions.controller';
import { Role } from '../organisation-role/entities/role.entity';
import { Organisation } from '../organisations/entities/organisations.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Permissions } from '../organisation-permissions/entities/permissions.entity';

@Module({
  providers: [OrganisationPermissionsService],
  controllers: [OrganisationPermissionsController],
  imports: [TypeOrmModule.forFeature([Organisation, Role, Permissions])],
})
export class OrganisationPermissionsModule {}
