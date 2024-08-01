import { ConflictException, NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { DefaultPermissions } from '../../organisation-permissions/entities/default-permissions.entity';
import { Permissions } from '../../organisation-permissions/entities/permissions.entity';
import { Organisation } from '../../organisations/entities/organisations.entity';
import { OrganisationRole } from '../entities/organisation-role.entity';
import { OrganisationRoleService } from '../organisation-role.service';

describe('OrganisationRoleService', () => {
  let service: OrganisationRoleService;
  let rolesRepository: Repository<OrganisationRole>;
  let organisationRepository: Repository<Organisation>;
  let permissionRepository: Repository<Permissions>;
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
      ],
    }).compile();

    service = module.get<OrganisationRoleService>(OrganisationRoleService);
    rolesRepository = module.get<Repository<OrganisationRole>>(getRepositoryToken(OrganisationRole));
    organisationRepository = module.get<Repository<Organisation>>(getRepositoryToken(Organisation));
    permissionRepository = module.get<Repository<Permissions>>(getRepositoryToken(Permissions));
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
});
