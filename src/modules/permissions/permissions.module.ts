import { Module } from '@nestjs/common';
import { OrganisationPermissionsService } from './permissions.service';
import { OrganisationPermissionsController } from './permissions.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Permissions } from './entities/permissions.entity';
import { OrganisationUserRole } from '@modules/role/entities/organisation-user-role.entity';
import { Organisation } from '@modules/organisations/entities/organisations.entity';
import { Role } from '@modules/role/entities/role.entity';

@Module({
  providers: [OrganisationPermissionsService],
  controllers: [OrganisationPermissionsController],
  imports: [TypeOrmModule.forFeature([Organisation, OrganisationUserRole, Permissions, Role])],
})
export class OrganisationPermissionsModule {}
