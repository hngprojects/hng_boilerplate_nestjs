import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Job } from './entities/job.entity';
import { JobService } from './job.service';
import { Repository } from 'typeorm';
import { JobController } from './job.controller';
import { OrganisationsService } from '../organisations/organisations.service';
import { Organisation } from '../organisations/entities/organisations.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Job, Organisation])],
  controllers: [JobController],
  providers: [JobService, Repository],
  exports: [JobService],
})
export class JobModule {}
