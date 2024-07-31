import { Test, TestingModule } from '@nestjs/testing';
import { OrganisationRoleService } from '../organisation-role.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { OrganisationRole } from '../entities/organisation-role.entity';
import { Organisation } from '../../organisations/entities/organisations.entity';
import { DefaultPermissions } from '../../organisation-permissions/entities/default-permissions.entity';
import { Repository } from 'typeorm';
import { ConflictException, NotFoundException } from '@nestjs/common';

describe('OrganisationRoleService', () => {
  let service: OrganisationRoleService;
  let rolesRepository: Repository<OrganisationRole>;
  let organisationRepository: Repository<Organisation>;
  let permissionRepository: Repository<DefaultPermissions>;

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
          provide: getRepositoryToken(DefaultPermissions),
          useClass: Repository,
        },
      ],
    }).compile();

    service = module.get<OrganisationRoleService>(OrganisationRoleService);
    rolesRepository = module.get<Repository<OrganisationRole>>(getRepositoryToken(OrganisationRole));
    organisationRepository = module.get<Repository<Organisation>>(getRepositoryToken(Organisation));
    permissionRepository = module.get<Repository<DefaultPermissions>>(getRepositoryToken(DefaultPermissions));
  });

  describe('createOrgRoles', () => {
    it('should create a role successfully', async () => {
      const createRoleDto = { name: 'TestRole', description: 'Test Description' };
      const organisationId = 'org123';
      const mockOrganisation = { id: organisationId };
      const mockDefaultPermissions = [{ id: 'perm1' }];

      jest.spyOn(organisationRepository, 'findOne').mockResolvedValue(mockOrganisation as Organisation);
      jest.spyOn(rolesRepository, 'findOne').mockResolvedValue(null);
      jest.spyOn(permissionRepository, 'find').mockResolvedValue(mockDefaultPermissions as DefaultPermissions[]);
      jest.spyOn(rolesRepository, 'create').mockReturnValue({ ...createRoleDto } as OrganisationRole);
      jest.spyOn(rolesRepository, 'save').mockResolvedValue({ id: 'role123', ...createRoleDto } as OrganisationRole);

      const result = await service.createOrgRoles(createRoleDto, organisationId);

      expect(result).toHaveProperty('id');
      expect(result.name).toBe(createRoleDto.name);
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
});