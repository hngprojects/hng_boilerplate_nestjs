import { Test, TestingModule } from '@nestjs/testing';
import { OrganisationRoleController } from './organisation-role.controller';
import { OrganisationRoleService } from './organisation-role.service';

describe('OrganisationRoleController', () => {
  let controller: OrganisationRoleController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [OrganisationRoleController],
      providers: [OrganisationRoleService],
    }).compile();

    controller = module.get<OrganisationRoleController>(OrganisationRoleController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
