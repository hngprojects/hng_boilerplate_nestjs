import { Test, TestingModule } from '@nestjs/testing';
import { OrganisationRoleService } from '../organisation-role.service';
import { Repository } from 'typeorm';
import { OrganisationRole } from '../entities/organisation-role.entity';
import { Organisation } from 'src/modules/organisations/entities/organisations.entity';
import { getRepositoryToken } from '@nestjs/typeorm';
import { BadRequestException, NotFoundException, UnauthorizedException } from '@nestjs/common';

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
    const currentUser = { role: 'admin', organizationId: organisationId };

    const role = new OrganisationRole();
    role.id = roleId;
    role.organisation = new Organisation();
    role.organisation.id = organisationId;
    role.isDeleted = false;

    jest.spyOn(roleRepository, 'findOne').mockResolvedValue(role);
    jest.spyOn(organisationRepository, 'count').mockResolvedValue(0);
    jest.spyOn(roleRepository, 'save').mockResolvedValue(role);

    const result = await service.deleteRole(organisationId, roleId, currentUser);

    expect(roleRepository.findOne).toHaveBeenCalledWith({
      where: { id: roleId, organisation: { id: organisationId }, isDeleted: false },
    });
    expect(organisationRepository.count).toHaveBeenCalledWith({ where: { roles: { id: roleId } } });
    expect(roleRepository.save).toHaveBeenCalledWith({ ...role, isDeleted: true });
    expect(result).toEqual({ status_code: 200, message: 'Role successfully removed' });
  });

  it('should throw NotFoundException if role does not exist', async () => {
    const roleId = 'non-existent-role-id';
    const organisationId = 'test-org-id';
    const currentUser = { role: 'admin', organizationId: organisationId };

    jest.spyOn(roleRepository, 'findOne').mockResolvedValue(null);

    await expect(service.deleteRole(organisationId, roleId, currentUser)).rejects.toThrow(NotFoundException);
  });

  it('should throw BadRequestException if role is associated with organisations', async () => {
    const roleId = 'test-role-id';
    const organisationId = 'test-org-id';
    const currentUser = { role: 'admin', organizationId: organisationId };

    const role = new OrganisationRole();
    role.id = roleId;
    role.organisation = new Organisation();
    role.organisation.id = organisationId;
    role.isDeleted = false;

    jest.spyOn(roleRepository, 'findOne').mockResolvedValue(role);
    jest.spyOn(organisationRepository, 'count').mockResolvedValue(5);

    await expect(service.deleteRole(organisationId, roleId, currentUser)).rejects.toThrow(BadRequestException);
  });

  it('should throw UnauthorizedException if user is not authorized', async () => {
    const roleId = 'test-role-id';
    const organisationId = 'test-org-id';
    const currentUser = { role: 'user', organizationId: organisationId };

    await expect(service.deleteRole(organisationId, roleId, currentUser)).rejects.toThrow(UnauthorizedException);
  });
});
