import { Module } from '@nestjs/common';
import { OrganisationRoleService } from './organisation-role.service';
import { OrganisationRoleController } from './organisation-role.controller';

@Module({
  providers: [OrganisationRoleService],
  controllers: [OrganisationRoleController],
})
export class OrganisationRoleModule {}
