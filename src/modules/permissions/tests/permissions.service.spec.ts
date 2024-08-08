import { HttpStatus, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { OrganisationPermissionsService } from '../permissions.service';

import { Organisation } from '../../organisations/entities/organisations.entity';
import { Permissions } from '../entities/permissions.entity';
import { mockUpdatePermissionDto } from '../mocks/organisation-permissions.mock';
import { mockOrganisation } from '../mocks/organisation.mock';
import { mockRole } from '../mocks/role.mock';
import { Role } from '../../../modules/role/entities/role.entity';
import { CustomHttpException } from '../../../helpers/custom-http-filter';
import { RESOURCE_NOT_FOUND } from '../../../helpers/SystemMessages';
describe('OrganisationPermissionsService', () => {
  let service: OrganisationPermissionsService;
  let permissionRepository: Repository<Permissions>;
  let roleRepository: Repository<Role>;
  let organisationRepository: Repository<Organisation>;

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
        {
          provide: getRepositoryToken(Permissions),
          useClass: Repository,
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

  describe('createPermission', () => {
    it('should create and return a new permission', async () => {
      const title = 'Permission 1';
      const permission = { id: '1', title } as Permissions;

      jest.spyOn(permissionRepository, 'save').mockResolvedValueOnce(permission);

      const result = await service.createPermission(title);

      expect(result).toEqual(permission);
    });
  });

  describe('getPermissions', () => {
    it('should return all permissions', async () => {
      const permissions = [{ id: '1', title: 'Permission 1' }] as Permissions[];

      jest.spyOn(permissionRepository, 'find').mockResolvedValueOnce(permissions);

      const result = await service.getPermissions();

      expect(result).toEqual(permissions);
    });
  });

  describe('getAllPermissions', () => {
    it('should return a success response with all permissions', async () => {
      const permissions = [{ id: '1', title: 'Permission 1' }] as Permissions[];

      jest.spyOn(service, 'getPermissions').mockResolvedValueOnce(permissions);

      const result = await service.getAllPermissions();

      expect(result).toEqual({
        status_code: HttpStatus.OK,
        message: 'Permissions fetched successfully',
        data: permissions,
      });
    });
  });

  describe('getSinglePermission', () => {
    it('should throw not found exception if permission does not exist', async () => {
      jest.spyOn(service, 'getPermissionById').mockResolvedValueOnce(null);

      await expect(service.getSinglePermission('1')).rejects.toThrow(
        new CustomHttpException(RESOURCE_NOT_FOUND('Permission'), HttpStatus.NOT_FOUND)
      );
    });

    it('should return a success response with the permission', async () => {
      const permission = { id: '1', title: 'Permission 1' } as Permissions;

      jest.spyOn(service, 'getPermissionById').mockResolvedValueOnce(permission);

      const result = await service.getSinglePermission('1');

      expect(result).toEqual({
        status_code: HttpStatus.OK,
        message: 'Permission fetched successfully',
        data: permission,
      });
    });
  });

  describe('updatePermission', () => {
    it('should throw not found exception if permission does not exist', async () => {
      const payload = { id: '1', permission: { title: 'Updated Permission' } };

      jest.spyOn(permissionRepository, 'findOne').mockResolvedValueOnce(null);

      await expect(service.updatePermission(payload)).rejects.toThrow(
        new CustomHttpException(RESOURCE_NOT_FOUND('Permission'), HttpStatus.NOT_FOUND)
      );
    });

    it('should update and return the permission', async () => {
      const payload = { id: '1', permission: { title: 'Updated Permission' } };
      const permission = { id: '1', title: 'Permission 1' } as Permissions;
      const updatedPermission = { ...permission, title: payload.permission.title };

      jest.spyOn(permissionRepository, 'findOne').mockResolvedValueOnce(permission);
      jest.spyOn(permissionRepository, 'save').mockResolvedValueOnce(updatedPermission);

      const result = await service.updatePermission(payload);

      expect(result).toEqual({
        status_code: HttpStatus.OK,
        message: 'Permission updated successfully',
        data: {
          id: updatedPermission.id,
          title: updatedPermission.title,
        },
      });
    });
  });

  describe('getPermissionById', () => {
    it('should return the permission with the given id', async () => {
      const permission = { id: '1', title: 'Permission 1' } as Permissions;

      jest.spyOn(permissionRepository, 'findOne').mockResolvedValueOnce(permission);

      const result = await service.getPermissionById('1');

      expect(result).toEqual(permission);
    });
  });

  describe('getPermissionByTitle', () => {
    it('should return the permission with the given title', async () => {
      const permission = { id: '1', title: 'Permission 1' } as Permissions;

      jest.spyOn(permissionRepository, 'findOne').mockResolvedValueOnce(permission);

      const result = await service.getPermissionByTitle('Permission 1');

      expect(result).toEqual(permission);
    });
  });
});
