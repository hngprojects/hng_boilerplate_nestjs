import { Module } from '@nestjs/common';
import { OrganisationController } from './organisation.controller';
import { OrganisationService } from './organisation.service';

@Module({
  controllers: [OrganisationController],
  providers: [OrganisationService]
})
export class OrganisationModule {}
