import { Module } from '@nestjs/common';
import { OrganisationPermissionsService } from './organisation-permissions.service';
import { OrganisationPermissionsController } from './organisation-permissions.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { OrganisationPermission } from './entities/organisation-permission.entity';

@Module({
  imports: [TypeOrmModule.forFeature([OrganisationPermission])],
  controllers: [OrganisationPermissionsController],
  providers: [OrganisationPermissionsService],
})
export class OrganisationPermissionsModule {}
