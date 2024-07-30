import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { OrganisationPermissionsService } from './organisation-permissions.service';
import { CreateOrganisationPermissionDto } from './dto/create-organisation-permission.dto';
import { UpdateOrganisationPermissionDto } from './dto/update-organisation-permission.dto';
import { ApiTags } from '@nestjs/swagger';
import { skipAuth } from '../../helpers/skipAuth';

@skipAuth()
@ApiTags('Organisation Settings')
@Controller('organisation-permissions')
export class OrganisationPermissionsController {
  constructor(private readonly organisationPermissionsService: OrganisationPermissionsService) {}

  @Post()
  create(@Body() createOrganisationPermissionDto: CreateOrganisationPermissionDto) {
    return this.organisationPermissionsService.create(createOrganisationPermissionDto);
  }

  @Get()
  findAll() {
    return this.organisationPermissionsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.organisationPermissionsService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateOrganisationPermissionDto: UpdateOrganisationPermissionDto) {
    return this.organisationPermissionsService.update(+id, updateOrganisationPermissionDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.organisationPermissionsService.remove(+id);
  }
}
