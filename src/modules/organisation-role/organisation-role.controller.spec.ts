import { Test, TestingModule } from '@nestjs/testing';
import { OrganisationRoleController } from './organisation-role.controller';

describe('OrganisationRoleController', () => {
  let controller: OrganisationRoleController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [OrganisationRoleController],
    }).compile();

    controller = module.get<OrganisationRoleController>(OrganisationRoleController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
