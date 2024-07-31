import { Controller, Get, Post, Body, Patch, Param, Delete, HttpCode, HttpStatus, UseGuards } from '@nestjs/common';
import { OrganisationRoleService } from './organisation-role.service';
import { UpdateOrganisationRoleDto } from './dto/update-organisation-role.dto';
import { ApiBearerAuth, ApiOperation, ApiParam, ApiResponse, ApiTags } from '@nestjs/swagger';
import { OwnershipGuard } from '../../guards/authorization.guard';
import { AuthGuard } from '../../guards/auth.guard';

@ApiTags('Organisation Settings')
@ApiBearerAuth()
@Controller('organisation/roles')
export class OrganisationRoleController {
  constructor(private readonly organisationRoleService: OrganisationRoleService) {}

  @Get(':organisationId')
  @UseGuards(AuthGuard, OwnershipGuard)
  @ApiOperation({ summary: 'Get all organisation roles' })
  @ApiResponse({ status: 200, description: 'Success', type: [Object] })
  async getRoles(@Param('organisationId') organisationID: string) {
    const roles = await this.organisationRoleService.getAllRolesInOrg(organisationID);
    return {
      status_code: 200,
      data: roles,
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
