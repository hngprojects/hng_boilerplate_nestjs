import { ConflictException, Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { CreateOrganisationRoleDto } from './dto/create-organisation-role.dto';
import { UpdateOrganisationRoleDto } from './dto/update-organisation-role.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { OrganisationRole } from './entities/organisation-role.entity';
import { Organisation } from '../organisations/entities/organisations.entity';
import { OrganisationPermission } from '../organisation-permissions/entities/organisation-permission.entity';

@Injectable()
export class OrganisationRoleService {
  constructor(
    @InjectRepository(OrganisationRole)
    private rolesRepository: Repository<OrganisationRole>,
    @InjectRepository(Organisation)
    private organisationRepository: Repository<Organisation>,
    @InjectRepository(OrganisationPermission)
    private permissionRepository: Repository<OrganisationPermission>
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

      const defaultPermissions = await this.permissionRepository.find();
      role.permissions = defaultPermissions;

      return await this.rolesRepository.save(role);
    } catch (error) {
      if (error instanceof NotFoundException || error instanceof ConflictException) {
        throw error;
      }
      throw new InternalServerErrorException('Failed to create organization role');
    }
  }

  findAll() {
    return `This action returns all organisationRole`;
  }

  async findSingleRole(id: string, organisationId: string): Promise<OrganisationRole> {
    try {
      const role = await this.rolesRepository.findOne({
        where: { id, organisation: { id: organisationId } },
        relations: ['permissions'],
      });

      if (!role) {
        throw new NotFoundException(`The role with ID ${id} does not exist`);
      }

      return role;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new Error(`Failed to fetch role: ${error.message}`);
    }
  }

  update(id: number, updateOrganisationRoleDto: UpdateOrganisationRoleDto) {
    return `This action updates a #${id} organisationRole`;
  }

  remove(id: number) {
    return `This action removes a #${id} organisationRole`;
  }
}
