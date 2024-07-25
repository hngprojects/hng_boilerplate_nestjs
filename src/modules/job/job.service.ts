import { Injectable } from '@nestjs/common';
import { Job } from './entities/job.entity';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import CreateNewJobOption from './options/CreateNewJobOption';
import { OrganisationsService } from '../organisations/organisations.service';

@Injectable()
export class JobService {
  constructor(
    @InjectRepository(Job)
    private jobRepository: Repository<Job>,
    private organisationService: OrganisationsService
  ) {}

  async createJob(job: CreateNewJobOption) {
    try {
      const newJob = new Job();

      const organisation = await this.organisationService.findOrganisationById(job.organisation);

      if (!organisation) {
        throw new Error('Organisation not found');
      }

      Object.assign(newJob, job);
      newJob.organisation = organisation;

      await this.jobRepository.save(newJob);
      return newJob;
    } catch (error) {
      throw new Error(error.message);
    }
  }
}
