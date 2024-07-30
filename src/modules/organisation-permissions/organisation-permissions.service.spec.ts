import { Test, TestingModule } from '@nestjs/testing';
import { OrganisationPermissionsService } from './organisation-permissions.service';
import { Permissions } from './entities/permissions.entity';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Role } from '../organisation-role/entities/role.entity';
import { Organisation } from '../organisations/entities/organisations.entity';
import { HttpStatus, NotFoundException, InternalServerErrorException } from '@nestjs/common';
import { UpdatePermissionDto } from './dto/update-permission.dto';

describe('OrganisationPermissionsService', () => {
  let service: OrganisationPermissionsService;
  let permissionRepository: Repository<Permissions>;
  let roleRepository: Repository<Role>;
  let organisationRepository: Repository<Organisation>;

  const mockOrganisation = {
    id: 'org_123',
    name: 'Test Organization',
    role: [
      {
        id: 'role_456',
        name: 'Admin',
        permissions: [
          { id: 'perm_1', category: ' canViewTransactions', permission_list: true },
          { id: 'perm_2', category: 'canViewRefunds', permission_list: true },
          { id: 'perm_3', category: 'canLogRefunds', permission_list: true },
          { id: 'perm_4', category: 'canViewUsers', permission_list: true },
          { id: 'perm_5', category: 'canCreateUsers', permission_list: true },
          { id: 'perm_6', category: 'canEditUsers', permission_list: true },
          { id: 'perm_7', category: 'canBlacklistWhitelistUsers', permission_list: true },
        ],
      },
    ],
  } as Organisation;
  const mockRole = {
    id: 'role_456',
    name: 'Admin',
    permissions: [
      { id: 'perm_1', category: 'canViewTransactions', permission_list: true },
      { id: 'perm_2', category: 'canViewRefunds', permission_list: true },
      { id: 'perm_3', category: 'canLogRefunds', permission_list: true },
      { id: 'perm_4', category: 'canViewUsers', permission_list: true },
      { id: 'perm_5', category: 'canCreateUsers', permission_list: true },
      { id: 'perm_6', category: 'canEditUsers', permission_list: true },
      { id: 'perm_7', category: 'canBlacklistWhitelistUsers', permission_list: true },
    ],
  } as Role;

  const mockUpdatePermissionDto: UpdatePermissionDto = {
    permission_list: {
      canViewTransactions: true,
      canViewRefunds: true,
      canLogRefunds: false,
      canViewUsers: true,
      canCreateUsers: false,
      canEditUsers: true,
      canBlacklistWhitelistUsers: false,
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        OrganisationPermissionsService,
        {
          provide: getRepositoryToken(Permissions),
          useValue: {
            update: jest.fn(),
          },
        },
        {
          provide: getRepositoryToken(Role),
          useValue: {
            findOne: jest.fn(),
          },
        },
        {
          provide: getRepositoryToken(Organisation),
          useValue: {
            findOne: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<OrganisationPermissionsService>(OrganisationPermissionsService);
    permissionRepository = module.get<Repository<Permissions>>(getRepositoryToken(Permissions));
    roleRepository = module.get<Repository<Role>>(getRepositoryToken(Role));
    organisationRepository = module.get<Repository<Organisation>>(getRepositoryToken(Organisation));
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('handleUpdatePermission', () => {
    it('should update permission successfully', async () => {
      jest.spyOn(organisationRepository, 'findOne').mockResolvedValue(mockOrganisation);
      jest.spyOn(roleRepository, 'findOne').mockResolvedValue(mockRole);
      jest.spyOn(permissionRepository, 'update').mockResolvedValue({ affected: 1, raw: {}, generatedMaps: [] });

      const result = await service.handleUpdatePermission('org_123', 'role_456', mockUpdatePermissionDto);

      expect(result).toEqual({
        message: 'Permissions successfully updated',
        status_code: HttpStatus.OK,
      });
    });

    it('should throw NotFoundException if organization is not found', async () => {
      jest.spyOn(organisationRepository, 'findOne').mockResolvedValue(null);

      await expect(service.handleUpdatePermission('org_id', 'role_id', mockUpdatePermissionDto)).rejects.toThrow(
        new NotFoundException(`Organization with ID org_id not found`)
      );
    });

    it('should throw NotFoundException if role is not found in the organization', async () => {
      jest.spyOn(organisationRepository, 'findOne').mockResolvedValue({ ...mockOrganisation, role: [] });
      jest.spyOn(roleRepository, 'findOne').mockResolvedValue(null);

      await expect(service.handleUpdatePermission('org_id', 'role_id', mockUpdatePermissionDto)).rejects.toThrow(
        new NotFoundException(`Role with ID role_id not found in the specified organization`)
      );
    });

    it('should throw NotFoundException if permission is not found in the role', async () => {
      jest.spyOn(organisationRepository, 'findOne').mockResolvedValue(mockOrganisation);
      jest.spyOn(roleRepository, 'findOne').mockResolvedValue({ ...mockRole, permissions: [] });

      await expect(service.handleUpdatePermission('org_123', 'role_456', mockUpdatePermissionDto)).rejects.toThrow(
        new NotFoundException(`Permission not found in the specified role`)
      );
    });

    it('should throw InternalServerErrorException if update fails', async () => {
      jest.spyOn(organisationRepository, 'findOne').mockResolvedValue(mockOrganisation);
      jest.spyOn(roleRepository, 'findOne').mockResolvedValue(mockRole);
      jest.spyOn(permissionRepository, 'update').mockRejectedValue(new Error('Update failed'));

      await expect(service.handleUpdatePermission('org_123', 'role_456', mockUpdatePermissionDto)).rejects.toThrow(
        new InternalServerErrorException(`Failed to update permissions: Update failed`)
      );
    });
  });
});
