// import { Test, TestingModule } from '@nestjs/testing';
// import { OrganisationsController } from './organisations.controller';

// describe('OrganisationsController', () => {
//   let controller: OrganisationsController;

//   beforeEach(async () => {
//     const module: TestingModule = await Test.createTestingModule({
//       controllers: [OrganisationsController],
//     }).compile();

//     controller = module.get<OrganisationsController>(OrganisationsController);
//   });

//   it('should be defined', () => {
//     expect(controller).toBeDefined();
//   });
// });

//////////
import { Test, TestingModule } from '@nestjs/testing';
import { OrganisationsController } from './organisations.controller';
import { OrganisationsService } from './organisations.service';
import { Organisation } from '../entities/organisation.entity';

describe('OrganisationsController', () => {
  let controller: OrganisationsController;
  let service: OrganisationsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [OrganisationsController],
      providers: [
        {
          provide: OrganisationsService,
          useValue: {
            findById: jest.fn().mockImplementation((id: string) => {
              const org = new Organisation();
              org.org_id = id;
              org.org_name = 'Organisation Name';
              org.description = 'Description';
              org.created_at = new Date('2023-01-01T12:00:00Z');
              org.updated_at = new Date('2023-06-01T12:00:00Z');
              return org;
            }),
          },
        },
      ],
    }).compile();

    controller = module.get<OrganisationsController>(OrganisationsController);
    service = module.get<OrganisationsService>(OrganisationsService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should return organisation by id', async () => {
    const result = await controller.getOrganisationById('123');
    expect(result).toEqual({
      status: 'success',
      status_code: 200,
      data: {
        org_id: '123',
        org_name: 'Organisation Name',
        description: 'Description',
        address: '123 Street, City, Country',
        email: 'contact@organisation.com',
        created_at: new Date('2023-01-01T12:00:00Z'),
        updated_at: new Date('2023-06-01T12:00:00Z'),
      },
    });
  });
});
