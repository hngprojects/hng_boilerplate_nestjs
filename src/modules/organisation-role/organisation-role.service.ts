import { BadRequestException, ConflictException, Injectable, NotFoundException } from '@nestjs/common';
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
    const organisation = await this.organisationRepository.findOne({ where: { id: organisationId } });
    if (!organisation) {
      throw new NotFoundException('Organisation not found');
    }

    const existingRole = await this.rolesRepository.findOne({
      where: { name: createOrganisationRoleDto.name },
    });

    if (existingRole) {
      throw new ConflictException('A role with this name already exists in the organization');
    }

    const role = this.rolesRepository.create({
      ...createOrganisationRoleDto,
    });

    // Fetch default permissions
    const defaultPermissions = await this.permissionRepository.find();
    role.permissions = defaultPermissions;

    return this.rolesRepository.save(role);
  }

  findAll() {
    return `This action returns all organisationRole`;
  }

  findOne(id: number) {
    return `This action returns a #${id} organisationRole`;
  }

  update(id: number, updateOrganisationRoleDto: UpdateOrganisationRoleDto) {
    return `This action updates a #${id} organisationRole`;
  }

  async remove(organizationId: string, roleId: string) {
    const role = await this.rolesRepository.findOne({ where: { id: roleId, organizationId } });

    if (!role) {
      throw new NotFoundException(`The role with ID ${roleId} does not exist`);
    }
    const isAssigned = false;
    if (isAssigned) {
      throw new BadRequestException('Role is currently assigned to users');
    }
    await this.rolesRepository.softDelete(roleId);
  }
}
