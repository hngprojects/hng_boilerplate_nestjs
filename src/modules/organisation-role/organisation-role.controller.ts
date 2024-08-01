import {
  BadRequestException,
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  NotFoundException,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiParam, ApiResponse, ApiTags } from '@nestjs/swagger';
import { OwnershipGuard } from '../../guards/authorization.guard';
import { CreateOrganisationRoleDto } from './dto/create-organisation-role.dto';
import { OrganisationRoleService } from './organisation-role.service';
import { UpdateOrganisationRoleDto } from './dto/update-organisation-role.dto';

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

  @Get(':id/roles/:roleId')
  @ApiOperation({ summary: 'Fetch a single role within an organization' })
  @ApiParam({ name: 'id', required: true, description: 'ID of the role' })
  @ApiResponse({ status: 200, description: 'The role has been successfully fetched.' })
  @ApiResponse({ status: 400, description: 'Bad Request - Invalid role ID format.' })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  @ApiResponse({ status: 403, description: 'Forbidden.' })
  @ApiResponse({ status: 404, description: 'Not Found - Role does not exist.' })
  async findOne(@Param('roleId') roleId: string, @Param('id') organisationId: string) {
    try {
      const role = await this.organisationRoleService.findSingleRole(roleId, organisationId);
      return {
        status_code: 200,
        data: {
          id: role.id,
          name: role.name,
          description: role.description,
          permissions: role.permissions.map(permission => ({
            id: permission.id,
            category: permission.category,
            permission_list: permission.permission_list,
          })),
        },
      };
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new BadRequestException('Failed to fetch role');
    }
  }

  @Patch(':orgId/roles/:roleId')
  async update(
    updateRoleDto: UpdateOrganisationRoleDto,
    @Param('orgId') orgId: string,
    @Param('roleId') roleId: string
  ) {
    const data = await this.organisationRoleService.updateRole(updateRoleDto, orgId, roleId);

    return {
      status_code: 200,
      data,
    };
  }
}
