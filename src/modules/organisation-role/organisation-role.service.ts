import {
  ConflictException,
  HttpStatus,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { CreateOrganisationRoleDto } from './dto/create-organisation-role.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { OrganisationRole } from './entities/organisation-role.entity';
import { Organisation } from '../organisations/entities/organisations.entity';
import { DefaultPermissions } from '../organisation-permissions/entities/default-permissions.entity';

@Injectable()
export class OrganisationRoleService {
  constructor(
    @InjectRepository(OrganisationRole)
    private rolesRepository: Repository<OrganisationRole>,
    @InjectRepository(Organisation)
    private organisationRepository: Repository<Organisation>,
    @InjectRepository(DefaultPermissions)
    private permissionRepository: Repository<DefaultPermissions>
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
          message: 'A role with this name already exists in the organization',
        });
      }

      const role = this.rolesRepository.create({
        ...createOrganisationRoleDto,
        organisation,
      });

      const defaultPermissions = await this.permissionRepository.find();
      role.permissions = defaultPermissions;

      return await this.rolesRepository.save(role);
    } catch (error) {
      if (error instanceof NotFoundException || error instanceof ConflictException) {
        throw error;
      }
      throw new InternalServerErrorException({
        status_code: HttpStatus.INTERNAL_SERVER_ERROR,
        error: 'Internal Server Error',
        message: 'Failed to create organization role',
      });
    }
  }
  async getAllRolesInOrg(organisationID: string) {
    const organisation = await this.organisationRepository.findOne({
      where: { id: organisationID },
      relations: ['roles'],
    });
    if (!organisation) {
      throw new NotFoundException('Organisation not found');
    }

    return this.rolesRepository.find().then(roles =>
      roles.map(role => ({
        id: role.id,
        name: role.name,
        description: role.description,
      }))
    );
  }
}
