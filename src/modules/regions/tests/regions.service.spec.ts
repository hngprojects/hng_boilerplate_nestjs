import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { RegionsService } from '../regions.service';
import { Regions } from '../entities/region.entity';

const mockRegions = [
  {
    id: '1',
    regionCode: 'NA',
    regionName: 'North America',
    countryCode: 'US',
    status: 1,
    createdOn: new Date(),
    createdBy: 'admin',
    modifiedOn: new Date(),
    modifiedBy: 'admin',
    createdAt: new Date(),
    updatedAt: new Date(),
  },
];

describe('RegionsService', () => {
  let service: RegionsService;
  let repository: Repository<Regions>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RegionsService,
        {
          provide: getRepositoryToken(Regions),
          useValue: {
            find: jest.fn().mockResolvedValue(mockRegions),
          },
        },
      ],
    }).compile();

    service = module.get<RegionsService>(RegionsService);
    repository = module.get<Repository<Regions>>(getRepositoryToken(Regions));
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should return all regions', async () => {
    const regions = await service.getAllRegions();
    expect(regions).toEqual(mockRegions);
    expect(repository.find).toHaveBeenCalledTimes(1);
  });
});
