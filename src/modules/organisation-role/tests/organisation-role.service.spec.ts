import { BadRequestException, ConflictException, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { DefaultPermissions } from '../../organisation-permissions/entities/default-permissions.entity';
import { Permissions } from '../../organisation-permissions/entities/permissions.entity';
import { Organisation } from '../../organisations/entities/organisations.entity';
import { OrganisationRole } from '../entities/organisation-role.entity';
import { OrganisationRoleService } from '../organisation-role.service';
import { OrganisationMember } from '../../organisations/entities/org-members.entity';

describe('OrganisationRoleService', () => {
  let service: OrganisationRoleService;
  let rolesRepository: Repository<OrganisationRole>;
  let organisationRepository: Repository<Organisation>;
  let permissionRepository: Repository<Permissions>;
  let organisationMemberRepository: Repository<OrganisationMember>;
  let defaultPermissionRepository: Repository<DefaultPermissions>;

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
        {
          provide: getRepositoryToken(Permissions),
          useClass: Repository,
        },
        {
          provide: getRepositoryToken(DefaultPermissions),
          useClass: Repository,
        },
        {
          provide: getRepositoryToken(OrganisationMember),
          useClass: Repository,
        },
      ],
    }).compile();

    service = module.get<OrganisationRoleService>(OrganisationRoleService);
    rolesRepository = module.get<Repository<OrganisationRole>>(getRepositoryToken(OrganisationRole));
    organisationRepository = module.get<Repository<Organisation>>(getRepositoryToken(Organisation));
    permissionRepository = module.get<Repository<Permissions>>(getRepositoryToken(Permissions));
    organisationMemberRepository = module.get<Repository<OrganisationMember>>(getRepositoryToken(OrganisationMember));
  });

  describe('createOrgRoles', () => {
    it('should create a role successfully', async () => {
      const createRoleDto = { name: 'TestRole', description: 'Test Description', organisation: { id: 'org123' } };
      const organisationId = 'org123';
      const mockOrganisation = { id: organisationId };
      const mockDefaultPermissions = [{ id: 'perm1', category: 'category1', permission_list: true }];
      const mockPermissions = { id: 'perm1', category: 'category1', permission_list: true };
      const mockSavedRole = { id: 'role123', ...createRoleDto, permissions: [] };

      jest.spyOn(organisationRepository, 'findOne').mockResolvedValue(mockOrganisation as Organisation);
      jest.spyOn(rolesRepository, 'findOne').mockResolvedValue(null);
      jest
        .spyOn(service['defaultPermissionsRepository'], 'find')
        .mockResolvedValue(mockDefaultPermissions as DefaultPermissions[]);
      jest.spyOn(rolesRepository, 'create').mockReturnValue({ ...createRoleDto } as OrganisationRole);
      jest.spyOn(rolesRepository, 'save').mockResolvedValue(mockSavedRole as OrganisationRole);
      jest.spyOn(permissionRepository, 'save').mockResolvedValue(mockPermissions as Permissions);

      const result = await service.createOrgRoles(createRoleDto, organisationId);

      expect(result).toEqual(mockSavedRole);
      expect(rolesRepository.save).toHaveBeenCalledWith(
        expect.objectContaining({
          ...createRoleDto,
          organisation: mockOrganisation,
        })
      );
      expect(permissionRepository.save).toHaveBeenCalled();
    });

    it('should throw NotFoundException when organisation is not found', async () => {
      jest.spyOn(organisationRepository, 'findOne').mockResolvedValue(null);

      await expect(service.createOrgRoles({ name: 'TestRole' }, 'nonexistent')).rejects.toThrow(NotFoundException);
    });

    it('should throw ConflictException when role already exists', async () => {
      jest.spyOn(organisationRepository, 'findOne').mockResolvedValue({ id: 'org123' } as Organisation);
      jest.spyOn(rolesRepository, 'findOne').mockResolvedValue({ id: 'existing' } as OrganisationRole);

      await expect(service.createOrgRoles({ name: 'ExistingRole' }, 'org123')).rejects.toThrow(ConflictException);
    });
  });

  describe('getAllRolesInOrganisation', () => {
    it('should return an array of roles for an existing organisation', async () => {
      const organisationId = '1';
      const mockRoles = [
        { id: '1', name: 'Admin', description: 'Administrator role' },
        { id: '2', name: 'User', description: 'Regular user role' },
      ];

      jest.spyOn(organisationRepository, 'findOne').mockResolvedValue({ id: organisationId } as Organisation);
      jest.spyOn(rolesRepository, 'find').mockResolvedValue(mockRoles as OrganisationRole[]);

      const roles = await service.getAllRolesInOrg(organisationId);
      expect(roles).toEqual(mockRoles);
    });

    it('should throw NotFoundException if the organisation is not found', async () => {
      const organisationId = '1';
      jest.spyOn(organisationRepository, 'findOne').mockResolvedValue(null);

      await expect(service.getAllRolesInOrg(organisationId)).rejects.toThrow(NotFoundException);
    });
    it('should handle cases where roles are not available', async () => {
      const organisationId = '1';

      jest.spyOn(organisationRepository, 'findOne').mockResolvedValue({ id: organisationId } as Organisation);
      jest.spyOn(rolesRepository, 'find').mockResolvedValue([]);

      const roles = await service.getAllRolesInOrg(organisationId);
      expect(roles).toEqual([]);
    });

    it('should handle database errors gracefully', async () => {
      const organisationId = '1';

      jest.spyOn(organisationRepository, 'findOne').mockRejectedValue(new Error('Database error'));

      await expect(service.getAllRolesInOrg(organisationId)).rejects.toThrowError('Database error');
    });
  });

  describe('findSingleRole', () => {
    it('should find a role successfully', async () => {
      const roleId = 'role123';
      const organisationId = 'org123';
      const mockRole = { id: roleId, name: 'TestRole', permissions: [] };

      jest.spyOn(organisationRepository, 'findOne').mockResolvedValue({ id: organisationId } as Organisation);
      jest.spyOn(rolesRepository, 'findOne').mockResolvedValue(mockRole as OrganisationRole);

      const result = await service.findSingleRole(roleId, organisationId);

      expect(result).toEqual(mockRole);
    });

    it('should throw NotFoundException when organisation is not found', async () => {
      jest.spyOn(organisationRepository, 'findOne').mockResolvedValue(null);

      await expect(service.findSingleRole('role123', 'nonexistent')).rejects.toThrow(NotFoundException);
    });

    it('should throw NotFoundException when role is not found', async () => {
      jest.spyOn(organisationRepository, 'findOne').mockResolvedValue({ id: 'org123' } as Organisation);
      jest.spyOn(rolesRepository, 'findOne').mockResolvedValue(null);

      await expect(service.findSingleRole('nonexistent', 'org123')).rejects.toThrow(NotFoundException);
    });
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

    jest.spyOn(rolesRepository, 'findOne').mockResolvedValue(null);

    await expect(service.deleteRole(organisationId, roleId, currentUser)).rejects.toThrow(
      new NotFoundException(`The role with ID ${roleId} does not exist`)
    );
  });

  it('should throw BadRequestException if the role is assigned to users', async () => {
    const organisationId = 'org-id';
    const roleId = 'role-id';
    const currentUser = { role: 'admin', organisationId: organisationId };

    const role = new OrganisationRole();
    jest.spyOn(rolesRepository, 'findOne').mockResolvedValue(role);
    jest.spyOn(organisationMemberRepository, 'count').mockResolvedValue(1);

    await expect(service.deleteRole(organisationId, roleId, currentUser)).rejects.toThrow(
      new BadRequestException('Role is currently assigned to users')
    );
  });

  it('should delete the role successfully', async () => {
    const organisationId = 'org-id';
    const roleId = 'role-id';
    const currentUser = { role: 'admin', organisationId: organisationId };

    const role = new OrganisationRole();
    jest.spyOn(rolesRepository, 'findOne').mockResolvedValue(role);
    jest.spyOn(organisationMemberRepository, 'count').mockResolvedValue(0);
    jest.spyOn(rolesRepository, 'softDelete').mockResolvedValue(null);

    const result = await service.deleteRole(organisationId, roleId, currentUser);

    expect(rolesRepository.findOne).toHaveBeenCalledWith({
      where: { id: roleId, organisation: { id: organisationId }, isDeleted: false },
      relations: ['organisation'],
    });
    expect(organisationMemberRepository.count).toHaveBeenCalledWith({
      where: { organisation: { id: organisationId }, role: role.name },
    });
    expect(rolesRepository.softDelete).toHaveBeenCalledWith(roleId);
    expect(result).toEqual({ status_code: 200, message: 'Role successfully removed' });
  });
});
