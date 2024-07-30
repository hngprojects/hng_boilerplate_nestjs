import { Controller, Get, Post, Body, Patch, Param, Delete, HttpCode, HttpStatus, UseGuards } from '@nestjs/common';
import { OrganisationRoleService } from './organisation-role.service';
import { CreateOrganisationRoleDto } from './dto/create-organisation-role.dto';
import { UpdateOrganisationRoleDto } from './dto/update-organisation-role.dto';
import { ApiBearerAuth, ApiOperation, ApiParam, ApiResponse, ApiTags } from '@nestjs/swagger';
import { OwnershipGuard } from '../../guards/authorization.guard';
import { skipAuth } from '../../helpers/skipAuth';

@skipAuth()
@ApiTags('Organisation Settings')
@Controller('api/v1/organisation/:organisationId/roles')
@UseGuards(OwnershipGuard)
@ApiBearerAuth()
@Controller('organisation/roles')
export class OrganisationRoleController {
  constructor(private readonly organisationRoleService: OrganisationRoleService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a new role in an organization' })
  @ApiParam({ name: 'organisationId', required: true, description: 'ID of the organization' })
  @ApiResponse({ status: 201, description: 'The role has been successfully created.' })
  @ApiResponse({ status: 400, description: 'Bad Request.' })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  @ApiResponse({ status: 403, description: 'Forbidden.' })
  @ApiResponse({ status: 409, description: 'Conflict - Role with this name already exists.' })
  async create(@Body() createRoleDto: CreateOrganisationRoleDto, @Param('organisationId') organisationId: string) {
    const role = await this.organisationRoleService.createOrgRoles(createRoleDto, organisationId);
    return {
      id: role.id,
      name: role.name,
      description: role.description,
      message: 'Role created successfully',
    };
  }
  @Get()
  findAll() {
    return this.organisationRoleService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.organisationRoleService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateOrganisationRoleDto: UpdateOrganisationRoleDto) {
    return this.organisationRoleService.update(+id, updateOrganisationRoleDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.organisationRoleService.remove(+id);
  }
}
