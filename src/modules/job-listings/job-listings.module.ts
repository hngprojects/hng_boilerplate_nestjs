import { Module } from '@nestjs/common';
import { JobListingsService } from './job-listings.service';
import { JobListingsController } from './job-listings.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JobListing } from 'src/entities/job-listing.entity';

@Module({
  imports: [TypeOrmModule.forFeature([JobListing])],
  providers: [JobListingsService],
  controllers: [JobListingsController],
})
export class JobListingsModule {}
