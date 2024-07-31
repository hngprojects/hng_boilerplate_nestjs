import { Module } from '@nestjs/common';
import { OrganisationPermissionsService } from './organisation-permissions.service';
import { OrganisationPermissionsController } from './organisation-permissions.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DefaultPermissions } from './entities/default-permissions.entity';

@Module({
  imports: [TypeOrmModule.forFeature([DefaultPermissions])],
  controllers: [OrganisationPermissionsController],
  providers: [OrganisationPermissionsService],
})
export class OrganisationPermissionsModule {}
