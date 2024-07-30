import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { CreateOrganisationRoleDto } from './dto/create-organisation-role.dto';
import { UpdateOrganisationRoleDto } from './dto/update-organisation-role.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { OrganisationRole } from './entities/organisation-role.entity';
import { Organisation } from '../organisations/entities/organisations.entity';
import { User } from '../user/entities/user.entity';

@Injectable()
export class OrganisationRoleService {
  constructor(
    @InjectRepository(OrganisationRole)
    private rolesRepository: Repository<OrganisationRole>,
    @InjectRepository(Organisation)
    private organisationRepository: Repository<Organisation>
  ) {}

  findAll() {
    return `This action returns all organisationRole`;
  }

  findOne(id: number) {
    return `This action returns a #${id} organisationRole`;
  }

  update(id: number, updateOrganisationRoleDto: UpdateOrganisationRoleDto) {
    return `This action updates a #${id} organisationRole`;
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
}
