import { ConflictException, HttpException, HttpStatus, NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { DefaultPermissions } from '../../organisation-permissions/entities/default-permissions.entity';
import { Permissions } from '../../organisation-permissions/entities/permissions.entity';
import { Organisation } from '../../organisations/entities/organisations.entity';
import { OrganisationRole } from '../entities/organisation-role.entity';
import { OrganisationRoleService } from '../organisation-role.service';
import { UpdateOrganisationRoleDto } from '../dto/update-organisation-role.dto';
import { ORG_NOT_FOUND, ROLE_ALREADY_EXISTS, ROLE_NOT_FOUND } from '../../../helpers/SystemMessages';
import { CustomHttpException } from '../../../helpers/custom-http-filter';

describe('OrganisationRoleService', () => {
  let service: OrganisationRoleService;
  let rolesRepository: Repository<OrganisationRole>;
  let organisationRepository: Repository<Organisation>;
  let permissionRepository: Repository<Permissions>;
  let defaultPermissionsRepository: Repository<DefaultPermissions>;

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
      ],
    }).compile();

    service = module.get<OrganisationRoleService>(OrganisationRoleService);
    rolesRepository = module.get<Repository<OrganisationRole>>(getRepositoryToken(OrganisationRole));
    organisationRepository = module.get<Repository<Organisation>>(getRepositoryToken(Organisation));
    permissionRepository = module.get<Repository<Permissions>>(getRepositoryToken(Permissions));
    defaultPermissionsRepository = module.get<Repository<DefaultPermissions>>(getRepositoryToken(DefaultPermissions));
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
        .spyOn(defaultPermissionsRepository, 'find')
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

      await expect(service.createOrgRoles({ name: 'TestRole' }, 'nonexistent')).rejects.toThrow(
        new CustomHttpException(ORG_NOT_FOUND, HttpStatus.NOT_FOUND)
      );
    });

    it('should throw ConflictException when role already exists', async () => {
      jest.spyOn(organisationRepository, 'findOne').mockResolvedValue({ id: 'org123' } as Organisation);
      jest.spyOn(rolesRepository, 'findOne').mockResolvedValue({ id: 'existing' } as OrganisationRole);

      await expect(service.createOrgRoles({ name: 'ExistingRole' }, 'org123')).rejects.toThrow(
        new CustomHttpException(ROLE_ALREADY_EXISTS, HttpStatus.CONFLICT)
      );
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

      await expect(service.getAllRolesInOrg(organisationId)).rejects.toThrow(
        new CustomHttpException(ORG_NOT_FOUND, HttpStatus.NOT_FOUND)
      );
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

      await expect(service.findSingleRole('role123', 'nonexistent')).rejects.toThrow(
        new CustomHttpException(ORG_NOT_FOUND, HttpStatus.NOT_FOUND)
      );
    });

    it('should throw NotFoundException when role is not found', async () => {
      jest.spyOn(organisationRepository, 'findOne').mockResolvedValue({ id: 'org123' } as Organisation);
      jest.spyOn(rolesRepository, 'findOne').mockResolvedValue(null);

      await expect(service.findSingleRole('nonexistent', 'org123')).rejects.toThrow(
        new CustomHttpException(ROLE_NOT_FOUND, HttpStatus.NOT_FOUND)
      );
    });
  });

  describe('updateRole', () => {
    it('should update the role successfully', async () => {
      const updateRoleDto: UpdateOrganisationRoleDto = { name: 'Updated Role', description: 'Updated Description' };
      const orgId = 'org-id';
      const roleId = 'role-id';

      const organisation = new Organisation();
      organisation.id = orgId;

      const role = new OrganisationRole();
      role.id = roleId;
      role.name = 'Original Role';
      role.description = 'Original Description';
      role.organisation = organisation;

      jest.spyOn(organisationRepository, 'findOne').mockResolvedValue(organisation);
      jest.spyOn(rolesRepository, 'findOne').mockResolvedValue(role);
      jest.spyOn(rolesRepository, 'save').mockResolvedValue(role);

      const result = await service.updateRole(updateRoleDto, orgId, roleId);

      expect(result.name).toBe('Updated Role');
      expect(result.description).toBe('Updated Description');
      expect(rolesRepository.save).toHaveBeenCalledWith(expect.objectContaining(updateRoleDto));
    });

    it('should throw NotFoundException if the organisation does not exist', async () => {
      const updateRoleDto: UpdateOrganisationRoleDto = { name: 'Starlight Role', description: 'Updated Description' };
      const orgId = 'non-existent-org-id';
      const roleId = 'role-id';

      jest.spyOn(organisationRepository, 'findOne').mockResolvedValue(null);

      await expect(service.updateRole(updateRoleDto, orgId, roleId)).rejects.toThrow(
        new CustomHttpException(ORG_NOT_FOUND, HttpStatus.NOT_FOUND)
      );
    });

    it('should throw NotFoundException if the role does not exist', async () => {
      const updateRoleDto: UpdateOrganisationRoleDto = { name: 'Starlight Mentor', description: 'Updated Description' };
      const orgId = 'org-id';
      const roleId = 'non-existent-role-id';

      const organisation = new Organisation();
      organisation.id = orgId;

      jest.spyOn(organisationRepository, 'findOne').mockResolvedValue(organisation);
      jest.spyOn(rolesRepository, 'findOne').mockResolvedValue(null);

      await expect(service.updateRole(updateRoleDto, orgId, roleId)).rejects.toThrow(
        new CustomHttpException(ROLE_NOT_FOUND, HttpStatus.NOT_FOUND)
      );
    });
  });

  describe('removeRole', () => {
    it('should remove the role successfully', async () => {
      const orgId = 'c2316d10-5a04-4343-9e53-0173f53f6a51';
      const roleId = '52f56e95-7e23-4220-a419-96e96c957bcf';

      const organisation = new Organisation();
      organisation.id = orgId;

      const role = new OrganisationRole();
      role.id = roleId;
      role.organisation = organisation;

      jest.spyOn(organisationRepository, 'findOne').mockResolvedValue(organisation);
      jest.spyOn(rolesRepository, 'findOne').mockResolvedValue(role);
      jest.spyOn(rolesRepository, 'remove').mockResolvedValue(role);
      jest.spyOn(permissionRepository, 'delete').mockResolvedValue(undefined);

      const result = await service.removeRole(orgId, roleId);

      expect(result).toEqual({
        status_code: 200,
        message: 'Role successfully removed',
      });
    });

    it('should throw NotFoundException if the organisation does not exist', async () => {
      const orgId = 'non-existent-org-id';
      const roleId = 'role-id';

      jest.spyOn(organisationRepository, 'findOne').mockResolvedValue(null);

      await expect(service.removeRole(orgId, roleId)).rejects.toThrow(
        new CustomHttpException(ORG_NOT_FOUND, HttpStatus.NOT_FOUND)
      );
    });

    it('should throw NotFoundException if the role does not exist', async () => {
      const orgId = 'org-id';
      const roleId = 'non-existent-role-id';

      const organisation = new Organisation();
      organisation.id = orgId;

      jest.spyOn(organisationRepository, 'findOne').mockResolvedValue(organisation);
      jest.spyOn(rolesRepository, 'findOne').mockResolvedValue(null);

      await expect(service.removeRole(orgId, roleId)).rejects.toThrow(
        new CustomHttpException(ROLE_NOT_FOUND, HttpStatus.NOT_FOUND)
      );
    });
  });
});
