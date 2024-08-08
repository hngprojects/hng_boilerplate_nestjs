import { ConflictException, HttpStatus, NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { DefaultPermissions } from '../../permissions/entities/default-permissions.entity';
import { Permissions } from '../../permissions/entities/permissions.entity';
import { Organisation } from '../../organisations/entities/organisations.entity';
import { Role } from '../entities/role.entity';
import { RoleService } from '../role.service';
import { UpdateOrganisationRoleDto } from '../dto/update-organisation-role.dto';
import { OrganisationUserRole } from '../entities/organisation-user-role.entity';
import { EXISTING_ROLE, ROLE_CREATED_SUCCESSFULLY, ROLE_FETCHED_SUCCESSFULLY } from '../../../helpers/SystemMessages';
import { CustomHttpException } from '../../../helpers/custom-http-filter';
import { CreateRoleWithPermissionDto } from '../dto/create-role-with-permission.dto';
import { CreateOrganisationRoleDto } from '../dto/create-organisation-role.dto';

describe('RoleService', () => {
  let service: RoleService;
  let rolesRepository: Repository<Role>;
  let organisationRepository: Repository<Organisation>;
  let permissionRepository: Repository<Permissions>;
  let defaultPermissionRepository: Repository<DefaultPermissions>;
  let organisationUserRole: Repository<OrganisationUserRole>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RoleService,
        {
          provide: getRepositoryToken(Role),
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
          provide: getRepositoryToken(OrganisationUserRole),
          useClass: Repository,
        },
      ],
    }).compile();

    service = module.get<RoleService>(RoleService);
    rolesRepository = module.get<Repository<Role>>(getRepositoryToken(Role));
    organisationRepository = module.get<Repository<Organisation>>(getRepositoryToken(Organisation));
    permissionRepository = module.get<Repository<Permissions>>(getRepositoryToken(Permissions));
  });

  // describe('createRole', () => {
  //   it('should create a role successfully', async () => {
  //     const createRoleDto = { name: 'TestRole', description: 'Test Description' };
  //     const organisationId = 'org123';
  //     const mockOrganisation = { id: organisationId };
  //     const mockDefaultPermissions = [{ id: 'perm1', category: 'category1', permission_list: true }];
  //     const mockPermissions = { id: 'perm1', title: 'can_update' };
  //     const mockSavedRole = { id: 'role123', ...createRoleDto };
  //     const mockSavedRoleResult = {
  //       data: { ...mockSavedRole, permissions: [mockPermissions.title] },
  //       status_code: 201,
  //       message: ROLE_CREATED_SUCCESSFULLY,
  //     };

  //     jest.spyOn(rolesRepository, 'findOne').mockResolvedValue(null);
  //     jest.spyOn(rolesRepository, 'save').mockResolvedValue(mockSavedRole as Role);
  //     jest.spyOn(rolesRepository, 'findOne').mockResolvedValue(mockSavedRole as Role);
  //     jest.spyOn(permissionRepository, 'findOne').mockResolvedValue(mockPermissions as Permissions);
  //     jest.spyOn(rolesRepository, 'save').mockResolvedValue(mockSavedRoleResult.data as unknown as Role);

  //     const result = await service.createRoleWithPermissions({
  //       permissions_ids: [mockPermissions.title],
  //       rolePayload: createRoleDto,
  //     });

  //     expect(result).toEqual(mockSavedRoleResult);
  //     expect(permissionRepository.save).toHaveBeenCalled();
  //     expect(rolesRepository.save).toHaveBeenCalledWith(
  //       expect.objectContaining({
  //         ...createRoleDto,
  //       })
  //     );
  //   });

  //   it('should throw ConflictException when role already exists', async () => {
  //     jest.spyOn(organisationRepository, 'findOne').mockResolvedValue({ id: 'org123' } as Organisation);
  //     jest.spyOn(rolesRepository, 'findOne').mockResolvedValue({ id: 'existing', name: 'mockRole' } as Role);

  //     await expect(service.createRole({ name: 'mockRole' })).rejects.toThrow(CustomHttpException);
  //   });
  // });
  describe('createRole', () => {
    it('should throw conflict exception if role already exists', async () => {
      const createRoleOption: CreateOrganisationRoleDto = { name: 'admin' };

      jest.spyOn(rolesRepository, 'findOne').mockResolvedValueOnce({ id: '1', name: 'admin' } as Role);

      await expect(service.createRole(createRoleOption)).rejects.toThrow(
        new CustomHttpException(EXISTING_ROLE, HttpStatus.CONFLICT)
      );
    });

    it('should create and return a new role', async () => {
      const createRoleOption: CreateOrganisationRoleDto = { name: 'admin' };

      jest.spyOn(rolesRepository, 'findOne').mockResolvedValueOnce(null);
      jest.spyOn(rolesRepository, 'save').mockResolvedValueOnce({ id: '1', name: 'admin' } as Role);

      const result = await service.createRole(createRoleOption);

      expect(result).toEqual({ id: '1', name: 'admin' });
    });
  });

  describe('createRoleWithPermissions', () => {
    it('should create role and update permissions', async () => {
      const createRoleDto: CreateRoleWithPermissionDto = {
        rolePayload: { name: 'admin' },
        permissions_ids: ['perm1', 'perm2'],
      };

      const createdRole = { id: '1', name: 'admin' } as Role;

      jest.spyOn(service, 'createRole').mockResolvedValueOnce(createdRole);
      jest.spyOn(service, 'updateRolePermissions').mockResolvedValueOnce({
        ...createdRole,
        permissions: [
          { id: 'perm1', title: 'Permission 1' },
          { id: 'perm2', title: 'Permission 2' },
        ] as Permissions[],
      });

      const result = await service.createRoleWithPermissions(createRoleDto);

      expect(result).toEqual({
        status_code: HttpStatus.CREATED,
        message: ROLE_CREATED_SUCCESSFULLY,
        data: {
          id: '1',
          name: 'admin',
          description: '',
          permissions: ['Permission 1', 'Permission 2'],
        },
      });
    });
  });

  describe('updateRolePermissions', () => {
    it('should throw not found exception if role does not exist', async () => {
      jest.spyOn(rolesRepository, 'findOne').mockResolvedValueOnce(null);

      await expect(service.updateRolePermissions({ roleId: '1', permissions: [] })).rejects.toThrow(
        CustomHttpException
      );
    });

    it('should update and return role with new permissions', async () => {
      const role = { id: '1', name: 'admin', permissions: [] } as Role;
      const permissions = [{ id: 'perm1' } as Permissions];

      jest.spyOn(rolesRepository, 'findOne').mockResolvedValueOnce(role);
      jest.spyOn(permissionRepository, 'findOne').mockResolvedValueOnce(permissions[0]);
      jest.spyOn(rolesRepository, 'save').mockResolvedValueOnce({ ...role, permissions });

      const result = await service.updateRolePermissions({ roleId: '1', permissions: ['perm1'] });

      expect(result).toEqual({ ...role, permissions });
    });
  });

  describe('findSingleRole', () => {
    it('should throw not found exception if role does not exist', async () => {
      jest.spyOn(service, 'getRoleById').mockResolvedValueOnce(null);

      await expect(service.findSingleRole('1')).rejects.toThrow(CustomHttpException);
    });

    it('should return role data if role exists', async () => {
      const role = {
        id: '1',
        name: 'admin',
        description: 'Administrator role',
        permissions: [{ id: 'perm1', title: 'Permission 1' }],
      } as Role;

      jest.spyOn(service, 'getRoleById').mockResolvedValueOnce(role);

      const result = await service.findSingleRole('1');

      expect(result).toEqual({
        status_code: HttpStatus.OK,
        message: ROLE_FETCHED_SUCCESSFULLY,
        data: {
          id: '1',
          name: 'admin',
          description: 'Administrator role',
          permissions: [{ id: 'perm1', category: 'Permission 1' }],
        },
      });
    });
  });

  describe('updateRole', () => {
    it('should throw not found exception if role does not exist', async () => {
      const updateRoleOption = { id: '1', payload: { name: 'new name' } as UpdateOrganisationRoleDto };

      jest.spyOn(rolesRepository, 'findOne').mockResolvedValueOnce(null);

      await expect(service.updateRole(updateRoleOption)).rejects.toThrow(CustomHttpException);
    });

    it('should update and return the role', async () => {
      const updateRoleOption = { id: '1', payload: { name: 'new name' } as UpdateOrganisationRoleDto };
      const role = { id: '1', name: 'admin' } as Role;

      jest.spyOn(rolesRepository, 'findOne').mockResolvedValueOnce(role);
      jest.spyOn(rolesRepository, 'save').mockResolvedValueOnce({ ...role, ...updateRoleOption.payload });

      const result = await service.updateRole(updateRoleOption);

      expect(result).toEqual({ ...role, ...updateRoleOption.payload });
    });
  });
});
