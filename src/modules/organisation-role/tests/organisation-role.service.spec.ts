import { Test, TestingModule } from '@nestjs/testing';
import { OrganisationRoleService } from './organisation-role.service';
import { Repository } from 'typeorm';
import { OrganisationRole } from '../entities/organisation-role.entity';
import { Organisation } from 'src/modules/organisations/entities/organisations.entity';
import { getRepositoryToken } from '@nestjs/typeorm';

describe('OrganisationRoleService', () => {
  let service: OrganisationRoleService;
  let roleRepository: Repository<OrganisationRole>;
  let organisationRepository: Repository<Organisation>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        OrganisationRoleService,

        {
          provide: getRepositoryToken(OrganisationRole),
          useClass: Repository,
        },
        {
          provide: getRepositoryToken(Organisation),
          useClass: Repository,
        },
      ],
    }).compile();

    service = module.get<OrganisationRoleService>(OrganisationRoleService);
    roleRepository = module.get<Repository<OrganisationRole>>(getRepositoryToken(OrganisationRole));
    organisationRepository = module.get<Repository<Organisation>>(getRepositoryToken(Organisation));
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should delete a role successfully', async () => {
    const roleId = 'test-role-id';
    const organisationId = 'test-org-id';

    const role = new OrganisationRole();
    role.id = roleId;
    role.organisation = new Organisation();
    role.organisation = organisationId;

    jest.spyOn(roleRepository, 'findOne').mockResolvedValue(role);
    jest.spyOn(roleRepository, 'softDelete').mockResolvedValue(undefined);

    await service.deleteRole(organisationId, roleId);

    expect(roleRepository.findOne).toHaveBeenCalledWith({
      where: { id: roleId, organisation: { id: organisationId } },
    });
    expect(roleRepository.softDelete).toHaveBeenCalledWith(roleId);
  });

  it('should throw NotFoundException if role does not exist', async () => {
    const roleId = 'non-existent-role-id';
    const organisationId = 'test-org-id';

    jest.spyOn(roleRepository, 'findOne').mockResolvedValue(null);

    await expect(service.deleteRole(organisationId, roleId)).rejects.toThrow(NotFoundException);
  });

  it('should throw BadRequestException if role is assigned to users', async () => {
    const roleId = 'test-role-id';
    const organisationId = 'test-org-id';

    const role = new OrganisationRole();
    role.id = roleId;
    role.organisation = new Organisation();
    role.organisation.id = organisationId;

    jest.spyOn(roleRepository, 'findOne').mockResolvedValue(role);
    jest.spyOn(roleRepository, 'softDelete').mockImplementation(() => {
      throw new BadRequestException('Role is currently assigned to users');
    });

    await expect(service.deleteRole(organisationId, roleId)).rejects.toThrow(BadRequestException);
  });
});
