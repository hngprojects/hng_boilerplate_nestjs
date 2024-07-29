import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { CreateOrganisationRoleDto } from './dto/create-organisation-role.dto';
import { UpdateOrganisationRoleDto } from './dto/update-organisation-role.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { OrganisationRole } from './entities/organisation-role.entity';
import { Organisation } from '../organisations/entities/organisations.entity';

@Injectable()
export class OrganisationRoleService {
  constructor(
    @InjectRepository(OrganisationRole)
    private rolesRepository: Repository<OrganisationRole>,
    @InjectRepository(Organisation)
    private organisationRepository: Repository<Organisation>
  ) {}

  async getAllRoleInOrg(organisationID: string) {
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

  findAll() {
    return `This action returns all organisationRole`;
  }

  findOne(id: number) {
    return `This action returns a #${id} organisationRole`;
  }

  update(id: number, updateOrganisationRoleDto: UpdateOrganisationRoleDto) {
    return `This action updates a #${id} organisationRole`;
  }

  remove(id: number) {
    return `This action removes a #${id} organisationRole`;
  }
}
