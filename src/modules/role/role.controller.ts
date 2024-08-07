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
import { RoleService } from './role.service';
import { UpdateOrganisationRoleDto } from './dto/update-organisation-role.dto';

@ApiTags('organisation Settings')
@UseGuards(OwnershipGuard)
@ApiBearerAuth()
@Controller('organisations')
export class RoleController {
  constructor(private readonly roleService: RoleService) {}

  @Post('roles')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a new role in an organisation' })
  @ApiParam({ name: 'organisationId', required: true, description: 'ID of the organisation' })
  @ApiResponse({ status: 201, description: 'The role has been successfully created.' })
  @ApiResponse({ status: 400, description: 'Bad Request.' })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  @ApiResponse({ status: 403, description: 'Forbidden.' })
  @ApiResponse({ status: 409, description: 'Conflict - Role with this name already exists.' })
  async createRole(@Body() createRoleDto: CreateOrganisationRoleDto) {
    return await this.roleService.createRole(createRoleDto);
  }

  // @Get(':id/roles')
  // @ApiOperation({ summary: 'Get all organisation roles' })
  // @ApiResponse({ status: 200, description: 'Success', type: [Object] })
  // @ApiResponse({ status: 404, description: 'Organisation not found' })
  // async getRoles(@Param('id') organisationID: string) {
  //   const roles = await this.organisationRoleService.getAllRolesInOrganisation(organisationID);
  //   return {
  //     status_code: 200,
  //     data: roles,
  //   };
  // }

  @Get(':id/roles/:roleId')
  @ApiOperation({ summary: 'Fetch a single role within an organization' })
  @ApiParam({ name: 'id', required: true, description: 'ID of the role' })
  @ApiResponse({ status: 200, description: 'The role has been successfully fetched.' })
  @ApiResponse({ status: 400, description: 'Bad Request - Invalid role ID format.' })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  @ApiResponse({ status: 403, description: 'Forbidden.' })
  @ApiResponse({ status: 404, description: 'Not Found - Role does not exist.' })
  async findOne(@Param('roleId') roleId: string) {
    return await this.roleService.findSingleRole(roleId);
  }

  @Patch('roles/:roleId')
  @ApiOperation({ summary: 'update a role within an organization' })
  @ApiResponse({
    status: 200,
    description: 'The role has been successfully updated',
  })
  @ApiResponse({ status: 400, description: 'Invalid role ID format or input data' })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  @ApiResponse({ status: 403, description: 'Forbidden.' })
  @ApiResponse({ status: 404, description: 'Role not found' })
  @ApiResponse({ status: 404, description: 'Organisation not found' })
  async updateRole(updateRoleDto: UpdateOrganisationRoleDto, @Param('roleId') roleId: string) {
    const data = await this.roleService.updateRole({ id: roleId, payload: updateRoleDto });

    return {
      status_code: 200,
      data,
    };
  }
}
