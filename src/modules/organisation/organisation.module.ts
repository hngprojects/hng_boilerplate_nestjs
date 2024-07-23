import { Module } from '@nestjs/common';
import { OrganisationService } from './organisation.service';
import { OrganisationController } from './organisation.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Organisation } from './entities/organisation.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Organisation])],
  controllers: [OrganisationController],
  providers: [OrganisationService],
})
export class OrganisationModule {}
