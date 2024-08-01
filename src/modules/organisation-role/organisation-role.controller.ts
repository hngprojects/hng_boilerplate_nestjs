import { Body, Controller, Get, HttpCode, HttpStatus, Param, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiParam, ApiResponse, ApiTags } from '@nestjs/swagger';
import { OwnershipGuard } from '../../guards/authorization.guard';
import { CreateOrganisationRoleDto } from './dto/create-organisation-role.dto';
import { OrganisationRoleService } from './organisation-role.service';

@ApiTags('organisation Settings')
@UseGuards(OwnershipGuard)
@ApiBearerAuth()
@Controller('organisations')
export class OrganisationRoleController {
  constructor(private readonly organisationRoleService: OrganisationRoleService) {}

  @Post(':id/roles')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a new role in an organisation' })
  @ApiParam({ name: 'organisationId', required: true, description: 'ID of the organisation' })
  @ApiResponse({ status: 201, description: 'The role has been successfully created.' })
  @ApiResponse({ status: 400, description: 'Bad Request.' })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  @ApiResponse({ status: 403, description: 'Forbidden.' })
  @ApiResponse({ status: 409, description: 'Conflict - Role with this name already exists.' })
  async create(@Body() createRoleDto: CreateOrganisationRoleDto, @Param('id') organisationId: string) {
    const savedRole = await this.organisationRoleService.createOrgRoles(createRoleDto, organisationId);

    return {
      id: savedRole.id,
      status_code: HttpStatus.CREATED,
      name: savedRole.name,
      description: savedRole.description,
      message: 'Role created successfully',
    };
  }

  @Get(':id/roles')
  @ApiOperation({ summary: 'Get all organisation roles' })
  @ApiResponse({ status: 200, description: 'Success', type: [Object] })
  @ApiResponse({ status: 404, description: 'Organisation not found' })
  async getRoles(@Param('id') organisationID: string) {
    const roles = await this.organisationRoleService.getAllRolesInOrg(organisationID);
    return {
      status_code: 200,
      data: roles,
    };
  }
}
