import { Test, TestingModule } from '@nestjs/testing';
import { OrganisationRoleService } from './organisation-role.service';

describe('OrganisationRoleService', () => {
  let service: OrganisationRoleService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [OrganisationRoleService],
    }).compile();

    service = module.get<OrganisationRoleService>(OrganisationRoleService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
