import { Injectable } from '@nestjs/common';
import { CreateOrganisationPermissionDto } from './dto/create-organisation-permission.dto';
import { UpdateOrganisationPermissionDto } from './dto/update-organisation-permission.dto';

@Injectable()
export class OrganisationPermissionsService {
  create(createOrganisationPermissionDto: CreateOrganisationPermissionDto) {
    return 'This action adds a new organisationPermission';
  }

  findAll() {
    return `This action returns all organisationPermissions`;
  }

  findOne(id: number) {
    return `This action returns a #${id} organisationPermission`;
  }

  update(id: number, updateOrganisationPermissionDto: UpdateOrganisationPermissionDto) {
    return `This action updates a #${id} organisationPermission`;
  }

  remove(id: number) {
    return `This action removes a #${id} organisationPermission`;
  }
}
