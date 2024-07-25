import { Test, TestingModule } from '@nestjs/testing';
import { JobService } from '../job.service';
import { Repository } from 'typeorm';
import { Job } from '../entities/job.entity';
import { getRepositoryToken } from '@nestjs/typeorm';
import CreateNewJobOption from '../options/CreateNewJobOption';
import { Organisation } from '../../organisations/entities/organisations.entity';
import { OrganisationsService } from '../../organisations/organisations.service';

const mockJobRepository = {
  save: jest.fn(),
};

const mockOrganisationService = {
  findById: jest.fn(),
};

describe('JobService', () => {
  let service: JobService;
  let jobRepository: Repository<Job>;
  let organisationService: OrganisationsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        JobService,
        {
          provide: getRepositoryToken(Job),
          useValue: mockJobRepository,
        },
        {
          provide: OrganisationsService,
          useValue: mockOrganisationService,
        },
      ],
    }).compile();

    service = module.get<JobService>(JobService);
    jobRepository = module.get<Repository<Job>>(getRepositoryToken(Job));
    organisationService = module.get<OrganisationsService>(OrganisationsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('createJob', () => {
    it('should create a new job and save it', async () => {
      const jobData: CreateNewJobOption = {
        title: 'Software Engineer',
        description: 'Develop software applications',
        location: 'Remote',
        salary: '100000',
        job_type: 'Full-time',
        organisation: 'Tech Company',
      };

      const jobEntity = new Job();
      Object.assign(jobEntity, jobData);

      const organisation = new Organisation();
      organisation.id = 'Tech Company';
      mockOrganisationService.findById.mockResolvedValue(organisation);

      // Adjust the expected job entity
      const expectedJobEntity = { ...jobEntity, organisation };

      mockJobRepository.save.mockResolvedValue(expectedJobEntity);

      const result = await service.createJob(jobData);

      expect(organisationService.findOrganisationById).toHaveBeenCalledWith(jobData.organisation);
      expect(jobRepository.save).toHaveBeenCalledWith(expectedJobEntity);
      expect(result).toEqual(expectedJobEntity);
    });
  });
});
