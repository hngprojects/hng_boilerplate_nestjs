import {
  ConflictException,
  HttpStatus,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { DefaultPermissions } from '../organisation-permissions/entities/default-permissions.entity';
import { Permissions } from '../organisation-permissions/entities/permissions.entity';
import { Organisation } from '../organisations/entities/organisations.entity';
import { CreateOrganisationRoleDto } from './dto/create-organisation-role.dto';
import { OrganisationRole } from './entities/organisation-role.entity';
import { UpdateOrganisationRoleDto } from './dto/update-organisation-role.dto';
import { CustomHttpException } from '../../helpers/custom-http-filter';
import { ORG_NOT_FOUND, ROLE_ALREADY_EXISTS, ROLE_NOT_FOUND } from '../../helpers/SystemMessages';

@Injectable()
export class OrganisationRoleService {
  constructor(
    @InjectRepository(OrganisationRole)
    private rolesRepository: Repository<OrganisationRole>,
    @InjectRepository(Organisation)
    private organisationRepository: Repository<Organisation>,
    @InjectRepository(Permissions)
    private permissionRepository: Repository<Permissions>,
    @InjectRepository(DefaultPermissions)
    private defaultPermissionsRepository: Repository<DefaultPermissions>
  ) {}

  async createOrgRoles(createOrganisationRoleDto: CreateOrganisationRoleDto, organisationId: string) {
    const organisation = await this.organisationRepository.findOne({ where: { id: organisationId } });
    if (!organisation) {
      throw new CustomHttpException(ORG_NOT_FOUND, HttpStatus.NOT_FOUND);
    }

    const existingRole = await this.rolesRepository.findOne({
      where: { name: createOrganisationRoleDto.name, organisation: { id: organisationId } },
    });
    if (existingRole) {
      throw new CustomHttpException(ROLE_ALREADY_EXISTS, HttpStatus.CONFLICT);
    }

    const role = this.rolesRepository.create({
      ...createOrganisationRoleDto,
      organisation,
    });

    const createdRole = await this.rolesRepository.save(role);

    const defaultPermissions = await this.defaultPermissionsRepository.find();

    const rolePermissions = defaultPermissions.map(defaultPerm => {
      const permission = new Permissions();
      permission.category = defaultPerm.category;
      permission.permission_list = defaultPerm.permission_list;
      permission.role = role;
      return permission;
    });

    await this.permissionRepository.save(rolePermissions);

    return createdRole;
  }

  async getAllRolesInOrg(organisationID: string) {
    const organisation = await this.organisationRepository.findOne({
      where: { id: organisationID },
    });
    if (!organisation) {
      throw new CustomHttpException(ORG_NOT_FOUND, HttpStatus.NOT_FOUND);
    }

    return this.rolesRepository
      .find({ where: { organisation: { id: organisationID } }, select: ['id', 'name', 'description'] })
      .then(roles =>
        roles.map(role => ({
          id: role.id,
          name: role.name,
          description: role.description,
        }))
      );
  }

  async findSingleRole(id: string, organisationId: string): Promise<OrganisationRole> {
    const organisation = await this.organisationRepository.findOne({ where: { id: organisationId } });

    if (!organisation) {
      throw new CustomHttpException(ORG_NOT_FOUND, HttpStatus.NOT_FOUND);
    }

    const role = await this.rolesRepository.findOne({
      where: { id, organisation: { id: organisationId } },
      relations: ['permissions'],
    });

    if (!role) {
      throw new CustomHttpException(ROLE_NOT_FOUND, HttpStatus.NOT_FOUND);
    }

    return role;
  }

  async updateRole(updateRoleDto: UpdateOrganisationRoleDto, orgId: string, roleId: string) {
    const organisation = await this.organisationRepository.findOne({
      where: {
        id: orgId,
      },
    });

    if (!organisation) {
      throw new CustomHttpException(ORG_NOT_FOUND, HttpStatus.NOT_FOUND);
    }

    const role = await this.rolesRepository.findOne({
      where: {
        id: roleId,
        organisation: { id: orgId },
      },
    });

    if (!role) {
      throw new CustomHttpException(ROLE_NOT_FOUND, HttpStatus.NOT_FOUND);
    }

    Object.assign(role, updateRoleDto);
    await this.rolesRepository.save(role);

    return {
      id: role.id,
      name: role.name,
      description: role.description,
    };
  }

  async removeRole(orgId: string, roleId: string) {
    const organisation = await this.organisationRepository.findOne({
      where: {
        id: orgId,
      },
    });

    if (!organisation) {
      throw new CustomHttpException(ORG_NOT_FOUND, HttpStatus.NOT_FOUND);
    }

    const role = await this.rolesRepository.findOne({
      where: {
        id: roleId,
        organisation: { id: orgId },
      },
      relations: ['permissions'],
    });

    if (!role) {
      throw new CustomHttpException(ROLE_NOT_FOUND, HttpStatus.NOT_FOUND);
    }

    await this.permissionRepository.delete({ role: { id: roleId } });
    await this.rolesRepository.remove(role);

    return {
      status_code: 200,
      message: 'Role successfully removed',
    };
  }
}
