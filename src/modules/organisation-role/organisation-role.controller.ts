import {
  BadRequestException,
  Body,
  Controller,
  Delete,
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
import { CustomHttpException } from '../../helpers/custom-http-filter';
import { ROLE_NOT_FOUND } from '../../helpers/SystemMessages';

@ApiTags('Organization Settings')
@UseGuards(OwnershipGuard)
@ApiBearerAuth()
@Controller('organizations')
export class OrganisationRoleController {
  constructor(private readonly organisationRoleService: OrganisationRoleService) {}

  @Post(':orgId/roles')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a new role in an organisation' })
  @ApiResponse({
    status: 201,
    description: 'The role has been successfully created.',
    example: {
      id: '123456',
      status_code: 201,
      name: 'Admin',
      description: 'Administrator role',
      message: 'Role created successfully',
    },
  })
  @ApiResponse({ status: 400, description: 'Bad Request.' })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  @ApiResponse({ status: 409, description: 'A role with this name already exists in the organisation' })
  @ApiResponse({ status: 404, description: 'Organisation not found' })
  async create(@Body() createRoleDto: CreateOrganisationRoleDto, @Param('orgId') organisationId: string) {
    const savedRole = await this.organisationRoleService.createOrgRoles(createRoleDto, organisationId);

    return {
      id: savedRole.id,
      status_code: HttpStatus.CREATED,
      name: savedRole.name,
      description: savedRole.description,
      message: 'Role created successfully',
    };
  }

  @Get(':orgId/roles')
  @ApiOperation({ summary: 'Get all organisation roles' })
  @ApiResponse({
    status: 200,
    description: 'Success',
    example: {
      status_code: 200,
      data: [
        {
          id: '123456',
          name: 'Admin',
          description: 'Administrator role',
        },
        {
          id: '789012',
          name: 'Manager',
          description: 'Manager role',
        },
      ],
    },
  })
  @ApiResponse({ status: 404, description: 'Organisation not found' })
  async getRoles(@Param('orgId') organisationID: string) {
    const roles = await this.organisationRoleService.getAllRolesInOrg(organisationID);
    return {
      status_code: 200,
      data: roles,
    };
  }

  @Get(':orgId/roles/:roleId')
  @ApiOperation({ summary: 'Fetch a single role within an organization' })
  @ApiResponse({
    status: 200,
    description: 'The role has been successfully fetched.',
    example: {
      status_code: 200,
      data: {
        id: '123456',
        name: 'Admin',
        description: 'Administrator role',
        permissions: [
          {
            id: '789012',
            category: 'users',
            permission_list: ['create', 'update', 'delete'],
          },
          {
            id: '345678',
            category: 'roles',
            permission_list: ['create', 'update', 'delete'],
          },
        ],
      },
    },
  })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  @ApiResponse({ status: 403, description: 'Forbidden.' })
  @ApiResponse({ status: 404, description: 'Organisation not found' })
  @ApiResponse({ status: 404, description: 'Role not found in the organization' })
  async findOne(@Param('roleId') roleId: string, @Param('orgId') organisationId: string) {
    const role = await this.organisationRoleService.findSingleRole(roleId, organisationId);
    if (!role) {
      throw new CustomHttpException(ROLE_NOT_FOUND, HttpStatus.NOT_FOUND);
    }
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
  }

  @Patch(':orgId/roles/:roleId')
  @ApiOperation({ summary: 'Update a role within an organization' })
  @ApiResponse({
    status: 200,
    description: 'The role has been successfully updated',
    example: {
      status_code: 200,
      data: {
        id: '123456',
        name: 'Admin',
        description: 'Administrator role',
      },
      message: 'Role updated successfully',
    },
  })
  @ApiResponse({ status: 400, description: 'Invalid role ID format or input data' })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  @ApiResponse({ status: 403, description: 'Forbidden.' })
  @ApiResponse({ status: 404, description: 'Role not found' })
  @ApiResponse({ status: 404, description: 'Organisation not found' })
  async updateRole(
    @Body() updateRoleDto: UpdateOrganisationRoleDto,
    @Param('orgId') orgId: string,
    @Param('roleId') roleId: string
  ) {
    const data = await this.organisationRoleService.updateRole(updateRoleDto, orgId, roleId);

    return {
      status_code: 200,
      data,
      message: 'Role updated successfully',
    };
  }

  @Delete(':orgId/roles/:roleId')
  @ApiOperation({ summary: 'remove a role from an organization' })
  @ApiResponse({
    status: 200,
    description: 'Role successfully removed',
    example: {
      status_code: 200,
      message: 'Role successfully removed',
    },
  })
  @ApiResponse({ status: 404, description: 'Role not found' })
  @ApiResponse({ status: 404, description: 'Organisation not found' })
  async removeRole(@Param('orgId') orgId: string, @Param('roleId') roleId: string) {
    return this.organisationRoleService.removeRole(orgId, roleId);
  }
}
