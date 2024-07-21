// import { Test, TestingModule } from '@nestjs/testing';
// import { OrganisationsService } from './organisations.service';

// describe('OrganisationsService', () => {
//   let service: OrganisationsService;

//   beforeEach(async () => {
//     const module: TestingModule = await Test.createTestingModule({
//       providers: [OrganisationsService],
//     }).compile();

//     service = module.get<OrganisationsService>(OrganisationsService);
//   });

//   it('should be defined', () => {
//     expect(service).toBeDefined();
//   });
// });

import { Test, TestingModule } from '@nestjs/testing';
import { OrganisationsService } from './organisations.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Organisation } from '../entities/organisation.entity';

describe('OrganisationsService', () => {
  let service: OrganisationsService;
  let repository: Repository<Organisation>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        OrganisationsService,
        {
          provide: getRepositoryToken(Organisation),
          useClass: Repository,
        },
      ],
    }).compile();

    service = module.get<OrganisationsService>(OrganisationsService);
    repository = module.get<Repository<Organisation>>(getRepositoryToken(Organisation));
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should return organisation by id', async () => {
    const org = new Organisation();
    org.org_id = '123';
    org.org_name = 'Organisation Name';
    org.description = 'Description';
    org.created_at = new Date('2023-01-01T12:00:00Z');
    org.updated_at = new Date('2023-06-01T12:00:00Z');

    jest.spyOn(repository, 'findOne').mockResolvedValue(org);

    const result = await service.findById('123');
    expect(result).toEqual(org);
  });
});
