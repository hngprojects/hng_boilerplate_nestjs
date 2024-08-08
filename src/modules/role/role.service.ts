import {
  ConflictException,
  HttpStatus,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { DefaultPermissions } from '../permissions/entities/default-permissions.entity';
import { Permissions } from '../permissions/entities/permissions.entity';
import { Organisation } from '../organisations/entities/organisations.entity';
import { CreateOrganisationRoleDto } from './dto/create-organisation-role.dto';
import { OrganisationUserRole } from './entities/organisation-user-role.entity';
import { UpdateOrganisationRoleDto } from './dto/update-organisation-role.dto';
import { Role } from './entities/role.entity';
import {
  EXISTING_ROLE,
  RESOURCE_NOT_FOUND,
  ROLE_CREATED_SUCCESSFULLY,
  ROLE_CREATION_FAILED,
  ROLE_FETCHED_SUCCESSFULLY,
} from '../../helpers/SystemMessages';
import { CustomHttpException } from '../../helpers/custom-http-filter';
import { CreateRoleWithPermissionDto } from './dto/create-role-with-permission.dto';

@Injectable()
export class RoleService {
  constructor(
    @InjectRepository(Role)
    private rolesRepository: Repository<Role>,

    @InjectRepository(OrganisationUserRole)
    private organisationUserRole: Repository<OrganisationUserRole>,
    @InjectRepository(Organisation)
    private organisationRepository: Repository<Organisation>,
    @InjectRepository(Permissions)
    private permissionRepository: Repository<Permissions>,
    @InjectRepository(DefaultPermissions)
    private defaultPermissionsRepository: Repository<DefaultPermissions>
  ) {}

  async createRole(createRoleOption: CreateOrganisationRoleDto) {
    const existingRole = await this.rolesRepository.findOne({ where: { name: createRoleOption.name } });

    if (existingRole) {
      throw new CustomHttpException(EXISTING_ROLE, HttpStatus.CONFLICT);
    }
    const newRole = new Role();
    Object.assign(newRole, createRoleOption);

    const role = await this.rolesRepository.save(newRole);

    return role;
  }

  async createRoleWithPermissions(createRoleDto: CreateRoleWithPermissionDto) {
    const role = await this.createRole(createRoleDto.rolePayload);
    const roleWithPermissions = await this.updateRolePermissions({
      roleId: role.id,
      permissions: createRoleDto.permissions_ids,
    });

    return {
      status_code: HttpStatus.CREATED,
      message: ROLE_CREATED_SUCCESSFULLY,
      data: {
        id: roleWithPermissions.id,
        name: roleWithPermissions.name,
        description: roleWithPermissions.description || '',
        permissions: roleWithPermissions.permissions.map(permission => permission.title),
      },
    };
  }

  async getAllRolesInOrganisation(organisationId: string) {
    const organisation = await this.organisationRepository.findOne({
      where: { id: organisationId },
    });
    if (!organisation) {
      throw new NotFoundException('Organisation not found');
    }

    const query = (await this.organisationUserRole.find({ where: { organisation: { id: organisation.id } } })).map(
      organisationRole => organisationRole.role.id
    );
    return query;
  }

  public async getRoleById(id: string): Promise<Role> {
    return await this.rolesRepository.findOne({
      where: { id },
      relations: ['permissions'],
    });
  }

  async findSingleRole(id: string) {
    const role = await this.getRoleById(id);
    if (!role) {
      throw new CustomHttpException(RESOURCE_NOT_FOUND('Role'), HttpStatus.NOT_FOUND);
    }
    return {
      status_code: HttpStatus.OK,
      message: ROLE_FETCHED_SUCCESSFULLY,
      data: {
        id: role.id,
        name: role.name,
        description: role.description,
        permissions: role.permissions.map(permission => ({
          id: permission.id,
          category: permission.title,
        })),
      },
    };
  }

  async updateRole(updateRoleOption: { id: string; payload: UpdateOrganisationRoleDto }) {
    const role = await this.rolesRepository.findOne({
      where: {
        id: updateRoleOption.id,
      },
    });

    if (!role) {
      throw new CustomHttpException(RESOURCE_NOT_FOUND('Role'), HttpStatus.NOT_FOUND);
    }
    Object.assign(role, updateRoleOption.payload);
    await this.rolesRepository.save(role);
    return role;
  }

  async updateRolePermissions({ roleId, permissions }: { roleId: string; permissions?: string[] }) {
    const role = await this.rolesRepository.findOne({
      where: {
        id: roleId,
      },
      relations: ['permissions'],
    });

    if (!role) {
      throw new CustomHttpException(RESOURCE_NOT_FOUND('Role'), HttpStatus.NOT_FOUND);
    }

    const currentRolePermissions = role.permissions;
    const newPermissions: Permissions[] = [];
    for (let permission of permissions) {
      const permissionInstance = await this.permissionRepository.findOne({ where: { id: permission } });
      newPermissions.push(permissionInstance);
    }

    const updatedPermissions = [...currentRolePermissions, ...newPermissions];
    role.permissions = updatedPermissions;

    if (!role) {
      throw new NotFoundException({
        status_code: HttpStatus.NOT_FOUND,
        error: 'Role not found',
        message: `The role with ID ${roleId} does not exist`,
      });
    }

    await this.rolesRepository.save(role);
    return role;
  }
}
