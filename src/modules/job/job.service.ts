import { Injectable } from '@nestjs/common';
import { Job } from './entities/job.entity';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import CreateNewJobOption from './options/CreateNewJobOption';
import { Organisation } from '../organisations/entities/organisations.entity';
import { OrganisationsService } from '../organisations/organisations.service';

@Injectable()
export class JobService {
  constructor(
    @InjectRepository(Job)
    private jobRepository: Repository<Job>,
    private organisationService: OrganisationsService // Inject OrganisationsService directly
  ) {}

  async createJob(job: CreateNewJobOption) {
    const newJob = new Job();

    // Find the organisation by its id or any other identifier
    const organisation = await this.organisationService.findById(job.organisation);

    if (!organisation) {
      throw new Error('Organisation not found');
    }

    newJob.title = job.title;
    newJob.description = job.description;
    newJob.location = job.location;
    newJob.salary = job.salary;
    newJob.job_type = job.job_type;
    newJob.organisation = organisation;

    await this.jobRepository.save(newJob);
    return newJob;
  }
}
