import { ConflictException, Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { CreateOrganisationRoleDto } from './dto/create-organisation-role.dto';
import { UpdateOrganisationRoleDto } from './dto/update-organisation-role.dto';
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
        throw new NotFoundException('Organisation not found');
      }

      const existingRole = await this.rolesRepository.findOne({
        where: { name: createOrganisationRoleDto.name, organisation: { id: organisationId } },
      });

      if (existingRole) {
        throw new ConflictException('A role with this name already exists in the organization');
      }

      const role = this.rolesRepository.create({
        ...createOrganisationRoleDto,
      });

      role.organisation = organisation;

      const defaultPermissions = await this.permissionRepository.find();

      role.permissions = defaultPermissions;

      return await this.rolesRepository.save(role);
    } catch (error) {
      const errorType = error.constructor;
      if (errorType.name == 'NotFoundException' || errorType.name == 'ConflictException') {
        throw error;
      }
      throw new InternalServerErrorException('Failed to create organization role');
    }
  }

  findAll() {
    return `This action returns all organisationRole`;
  }

  update(id: number, updateOrganisationRoleDto: UpdateOrganisationRoleDto) {
    return `This action updates a #${id} organisationRole`;
  }

  remove(id: number) {
    return `This action removes a #${id} organisationRole`;
  }
}
