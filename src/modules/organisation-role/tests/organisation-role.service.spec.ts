import { Test, TestingModule } from '@nestjs/testing';
import { OrganisationRoleService } from '../organisation-role.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { OrganisationRole } from '../entities/organisation-role.entity';
import { Organisation } from '../../organisations/entities/organisations.entity';
import { OrganisationPermission } from '../../organisation-permissions/entities/organisation-permission.entity';
import { Repository } from 'typeorm';
import { NotFoundException, ConflictException } from '@nestjs/common';

describe('OrganisationRoleService', () => {
  let service: OrganisationRoleService;
  let roleRepository: Repository<OrganisationRole>;
  let organisationRepository: Repository<Organisation>;
  let permissionRepository: Repository<OrganisationPermission>;

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
          provide: getRepositoryToken(OrganisationPermission),
          useClass: Repository,
        },
      ],
    }).compile();

    service = module.get<OrganisationRoleService>(OrganisationRoleService);
    roleRepository = module.get<Repository<OrganisationRole>>(getRepositoryToken(OrganisationRole));
    organisationRepository = module.get<Repository<Organisation>>(getRepositoryToken(Organisation));
    permissionRepository = module.get<Repository<OrganisationPermission>>(getRepositoryToken(OrganisationPermission));
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('createOrgRoles', () => {
    it('should create a role successfully', async () => {
      const createRoleDto = { name: 'Test Role', description: 'Test Description' };
      const organisationId = 'org123';
      const organisation = { id: organisationId };
      const defaultPermissions = [{ id: 'perm1' }];

      jest.spyOn(organisationRepository, 'findOne').mockResolvedValue(organisation as any);
      jest.spyOn(roleRepository, 'findOne').mockResolvedValue(null);
      jest.spyOn(permissionRepository, 'find').mockResolvedValue(defaultPermissions as any);
      jest.spyOn(roleRepository, 'create').mockReturnValue(createRoleDto as any);
      jest.spyOn(roleRepository, 'save').mockResolvedValue({ id: 'role123', ...createRoleDto } as any);

      const result = await service.createOrgRoles(createRoleDto, organisationId);

      expect(result).toEqual({ id: 'role123', ...createRoleDto });
    });

    it('should throw NotFoundException when organisation is not found', async () => {
      jest.spyOn(organisationRepository, 'findOne').mockResolvedValue(null);

      await expect(service.createOrgRoles({ name: 'Test' }, 'nonexistent')).rejects.toThrow(NotFoundException);
    });

    it('should throw ConflictException when role already exists', async () => {
      jest.spyOn(organisationRepository, 'findOne').mockResolvedValue({ id: 'org123' } as any);
      jest.spyOn(roleRepository, 'findOne').mockResolvedValue({ id: 'existing' } as any);

      await expect(service.createOrgRoles({ name: 'Existing' }, 'org123')).rejects.toThrow(ConflictException);
    });
  });

  describe('findSingleRole', () => {
    it('should find a role successfully', async () => {
      const roleId = 'role123';
      const organisationId = 'org123';
      const role = { id: roleId, name: 'Test Role', permissions: [] };

      jest.spyOn(roleRepository, 'findOne').mockResolvedValue(role as any);

      const result = await service.findSingleRole(roleId, organisationId);

      expect(result).toEqual(role);
    });

    it('should throw NotFoundException when role is not found', async () => {
      jest.spyOn(roleRepository, 'findOne').mockResolvedValue(null);

      await expect(service.findSingleRole('nonexistent', 'org123')).rejects.toThrow(NotFoundException);
    });
  });
});
