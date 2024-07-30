import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  HttpCode,
  HttpStatus,
  UseGuards,
  NotFoundException,
  BadRequestException,
  InternalServerErrorException,
} from '@nestjs/common';
import { OrganisationRoleService } from './organisation-role.service';
import { CreateOrganisationRoleDto } from './dto/create-organisation-role.dto';
import { UpdateOrganisationRoleDto } from './dto/update-organisation-role.dto';
import { ApiBearerAuth, ApiOperation, ApiParam, ApiResponse, ApiTags } from '@nestjs/swagger';
import { OwnershipGuard } from '../../guards/authorization.guard';
import { skipAuth } from '../../helpers/skipAuth';

@ApiTags('Organisation Settings')
@UseGuards(OwnershipGuard)
@ApiBearerAuth()
@skipAuth()
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
    try {
      const role = await this.organisationRoleService.createOrgRoles(createRoleDto, organisationId);
      return {
        id: role.id,
        name: role.name,
        description: role.description,
        message: 'Role created successfully',
      };
    } catch (error) {
      if (error instanceof InternalServerErrorException) {
        throw error;
      }
      throw new InternalServerErrorException('Failed to create organization role');
    }
  }

  @Get()
  findAll() {
    return this.organisationRoleService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Fetch a single role within an organization' })
  @ApiParam({ name: 'id', required: true, description: 'ID of the role' })
  @ApiResponse({ status: 200, description: 'The role has been successfully fetched.' })
  @ApiResponse({ status: 400, description: 'Bad Request - Invalid role ID format.' })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  @ApiResponse({ status: 403, description: 'Forbidden.' })
  @ApiResponse({ status: 404, description: 'Not Found - Role does not exist.' })
  async findOne(@Param('id') id: string, @Param('organisationId') organisationId: string) {
    try {
      const role = await this.organisationRoleService.findSingleRole(id, organisationId);
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

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateOrganisationRoleDto: UpdateOrganisationRoleDto) {
    return this.organisationRoleService.update(+id, updateOrganisationRoleDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.organisationRoleService.remove(+id);
  }
}
