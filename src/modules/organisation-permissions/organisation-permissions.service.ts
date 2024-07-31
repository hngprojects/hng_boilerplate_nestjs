import { HttpStatus, Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { OrganisationRole } from '../organisation-role/entities/organisation-role.entity';
import { Permissions } from './entities/permissions.entity';
import { Organisation } from '../organisations/entities/organisations.entity';
import { UpdatePermissionDto } from './dto/update-permission.dto';

@Injectable()
export class OrganisationPermissionsService {
  constructor(
    @InjectRepository(Organisation)
    private readonly organisationRepository: Repository<Organisation>,
    @InjectRepository(OrganisationRole)
    private readonly roleRepository: Repository<OrganisationRole>,
    @InjectRepository(Permissions)
    private readonly permissionRepository: Repository<Permissions>
  ) {}

  async handleUpdatePermission(org_id: string, role_id: string, updatePermissionDto: UpdatePermissionDto) {
    await this.validateOrganizationAndRole(org_id, role_id);
    await this.validateAndUpdatePermissions(role_id, updatePermissionDto);
    return { message: 'Permissions successfully updated', status_code: HttpStatus.OK };
  }

  private async validateOrganizationAndRole(orgId: string, roleId: string): Promise<void> {
    const organisation = await this.organisationRepository.findOne({
      where: { id: orgId },
      relations: ['role'],
    });

    if (!organisation) {
      throw new NotFoundException(`Organization with ID ${orgId} not found`);
    }

    if (!organisation.role.some(role => role.id === roleId)) {
      throw new NotFoundException(`Role with ID ${roleId} not found in the specified organization`);
    }
  }

  private async validateAndUpdatePermissions(roleId: string, updatePermissionDto: UpdatePermissionDto): Promise<void> {
    const role = await this.roleRepository.findOne({
      where: { id: roleId },
      relations: ['permissions'],
    });

    if (!role) {
      throw new NotFoundException(`Role with ID ${roleId} not found`);
    }

    const rolePermissionCategories = new Set(role.permissions.map(p => p.category.trim()));
    const updatePromises = [];

    for (const [category, value] of Object.entries(updatePermissionDto.permission_list)) {
      if (!rolePermissionCategories.has(category)) {
        throw new NotFoundException(`Permission not found in the specified role`);
      }

      updatePromises.push(
        this.permissionRepository.update({ role: { id: roleId }, category }, { permission_list: value })
      );
    }

    try {
      await Promise.all(updatePromises);
    } catch (error) {
      throw new InternalServerErrorException(`Failed to update permissions: ${error.message}`);
    }
  }
}
