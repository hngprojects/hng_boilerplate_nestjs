import { Test, TestingModule } from '@nestjs/testing';
import { OrganisationRoleService } from '../organisation-role.service';
import { Repository } from 'typeorm';
import { OrganisationRole } from '../entities/organisation-role.entity';
import { Organisation } from '../../organisations/entities/organisations.entity';
import { getRepositoryToken } from '@nestjs/typeorm';
import { BadRequestException, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { organisationRoleMock } from '../../organisations/tests/mocks/organisation.mock';

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

  it('should throw UnauthorizedException if the user does not have the right role', async () => {
    const organisationId = 'org-id';
    const roleId = 'role-id';
    const currentUser = { role: 'user', organisationId: organisationId };

    await expect(service.deleteRole(organisationId, roleId, currentUser)).rejects.toThrow(UnauthorizedException);
  });

  it('should throw NotFoundException if the role does not exist', async () => {
    const organisationId = 'org-id';
    const roleId = 'role-id';
    const currentUser = { role: 'admin', organisationId: organisationId };

    jest.spyOn(roleRepository, 'findOne').mockResolvedValue(null);

    await expect(service.deleteRole(organisationId, roleId, currentUser)).rejects.toThrow(
      new NotFoundException(`The role with ID ${roleId} does not exist`)
    );
  });

  it('should throw BadRequestException if the role is assigned to users', async () => {
    const organisationId = 'org-id';
    const roleId = 'role-id';
    const currentUser = { role: 'admin', organisationId: organisationId };

    const role = organisationRoleMock;
    jest.spyOn(roleRepository, 'findOne').mockResolvedValue(role);
    jest.spyOn(organisationRepository, 'count').mockResolvedValue(1);

    await expect(service.deleteRole(organisationId, roleId, currentUser)).rejects.toThrow(
      new BadRequestException('Role is currently assigned to users')
    );
  });

  it('should delete the role successfully', async () => {
    const organisationId = 'org-id';
    const roleId = 'role-id';
    const currentUser = { role: 'admin', organisationId: organisationId };

    const role = organisationRoleMock;
    jest.spyOn(roleRepository, 'findOne').mockResolvedValue(role);
    jest.spyOn(organisationRepository, 'count').mockResolvedValue(0);
    jest.spyOn(roleRepository, 'softDelete').mockResolvedValue(null);

    const result = await service.deleteRole(organisationId, roleId, currentUser);

    expect(roleRepository.findOne).toHaveBeenCalledWith({
      where: { id: roleId, organisation: { id: organisationId }, isDeleted: false },
    });
    expect(organisationRepository.count).toHaveBeenCalledWith({
      where: {
        id: organisationId,
        organisationMembers: {
          role: { id: roleId },
        },
      },
      relations: ['organisationUsers', 'organisationUsers.role'],
    });
    expect(roleRepository.softDelete).toHaveBeenCalledWith(roleId);
    expect(result).toEqual({ status_code: 200, message: 'Role successfully removed' });
  });
});
