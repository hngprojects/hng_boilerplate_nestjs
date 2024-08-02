import {
  BadRequestException,
  ConflictException,
  HttpStatus,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { DefaultPermissions } from '../organisation-permissions/entities/default-permissions.entity';
import { Permissions } from '../organisation-permissions/entities/permissions.entity';
import { Organisation } from '../organisations/entities/organisations.entity';
import { CreateOrganisationRoleDto } from './dto/create-organisation-role.dto';
import { OrganisationRole } from './entities/organisation-role.entity';
import { UpdateOrganisationRoleDto } from './dto/update-organisation-role.dto';
import { OrganisationMember } from '../organisations/entities/org-members.entity';

@Injectable()
export class OrganisationRoleService {
  constructor(
    @InjectRepository(OrganisationRole)
    private rolesRepository: Repository<OrganisationRole>,
    @InjectRepository(Organisation)
    private organisationRepository: Repository<Organisation>,
    @InjectRepository(OrganisationMember)
    private organisationMemberRepository: Repository<OrganisationMember>,
    @InjectRepository(Permissions)
    private permissionRepository: Repository<Permissions>,
    @InjectRepository(DefaultPermissions)
    private defaultPermissionsRepository: Repository<DefaultPermissions>
  ) {}

  async createOrgRoles(createOrganisationRoleDto: CreateOrganisationRoleDto, organisationId: string) {
    try {
      const organisation = await this.organisationRepository.findOne({ where: { id: organisationId } });
      if (!organisation) {
        throw new NotFoundException({
          status_code: HttpStatus.NOT_FOUND,
          error: 'Not Found',
          message: 'Organisation not found',
        });
      }

      const existingRole = await this.rolesRepository.findOne({
        where: { name: createOrganisationRoleDto.name, organisation: { id: organisationId } },
      });
      if (existingRole) {
        throw new ConflictException({
          status_code: HttpStatus.CONFLICT,
          error: 'Conflict',
          message: 'A role with this name already exists in the organisation',
        });
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
    } catch (error) {
      if (error instanceof NotFoundException || error instanceof ConflictException) {
        throw error;
      }
      throw new InternalServerErrorException({
        status_code: HttpStatus.INTERNAL_SERVER_ERROR,
        error: 'Internal Server Error',
        message: 'Failed to create organisation role',
      });
    }
  }

  async getAllRolesInOrg(organisationID: string) {
    const organisation = await this.organisationRepository.findOne({
      where: { id: organisationID },
    });
    if (!organisation) {
      throw new NotFoundException('Organisation not found');
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
    try {
      const organisation = await this.organisationRepository.findOne({ where: { id: organisationId } });

      if (!organisation) {
        throw new NotFoundException(`Organisation with ID ${organisationId} not found`);
      }

      const role = await this.rolesRepository.findOne({
        where: { id, organisation: { id: organisationId } },
        relations: ['permissions'],
      });

      if (!role) {
        throw new NotFoundException(`The role with ID ${id} does not exist in the organisation`);
      }

      return role;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new Error(`Failed to fetch role: ${error.message}`);
    }
  }

  async deleteRole(organisationId: string, roleId: string, currentUser) {
    if (!['superadmin', 'admin', 'owner'].includes(currentUser.role)) {
      throw new UnauthorizedException('You are not authorized to manage roles');
    }
    const role = await this.rolesRepository.findOne({
      where: { id: roleId, organisation: { id: organisationId }, isDeleted: false },
    });
    if (!role) {
      throw new NotFoundException(`The role with ID ${roleId} does not exist`);
    }
    const usersWithRole = await this.organisationRepository.count({
      where: {
        id: organisationId,
        organisationMembers: {
          role: { id: roleId },
        },
      },
      relations: ['organisationUsers', 'organisationUsers.role'],
    });

    if (usersWithRole > 0) {
      throw new BadRequestException('Role is currently assigned to users');
    }

    await this.rolesRepository.softDelete(roleId);

    return {
      status_code: 200,
      message: 'Role successfully removed',
    };
  }

  async updateRole(updateRoleDto: UpdateOrganisationRoleDto, orgId: string, roleId: string) {
    const organisation = await this.organisationRepository.findOne({
      where: {
        id: orgId,
      },
    });

    if (!organisation) {
      throw new NotFoundException({
        status_code: HttpStatus.NOT_FOUND,
        error: 'Organization not found',
        message: `The organization with ID ${orgId} does not exist`,
      });
    }

    const role = await this.rolesRepository.findOne({
      where: {
        id: roleId,
        organisation: organisation,
      },
    });

    if (!role) {
      throw new NotFoundException({
        status_code: HttpStatus.NOT_FOUND,
        error: 'Role not found',
        message: `The role with ID ${roleId} does not exist`,
      });
    }

    Object.assign(role, updateRoleDto);

    await this.rolesRepository.save(role);
    return role;
  }
}
