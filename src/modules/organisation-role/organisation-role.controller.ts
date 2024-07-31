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
  HttpException,
  BadRequestException,
  UnauthorizedException,
  Req,
} from '@nestjs/common';
import { OrganisationRoleService } from './organisation-role.service';
import { UpdateOrganisationRoleDto } from './dto/update-organisation-role.dto';
import { ApiBearerAuth, ApiOperation, ApiParam, ApiResponse, ApiTags } from '@nestjs/swagger';
import { OwnershipGuard } from '../../guards/authorization.guard';
import { AuthGuard } from '../../guards/auth.guard';

@ApiTags('Organisation Settings')
@ApiBearerAuth()
@Controller('organisation/')
export class OrganisationRoleController {
  constructor(private readonly organisationRoleService: OrganisationRoleService) {}

  @Get(':org_id/roles')
  @UseGuards(AuthGuard, OwnershipGuard)
  @ApiOperation({ summary: 'Get all organisation roles' })
  @ApiResponse({ status: 200, description: 'Success', type: [Object] })
  @ApiResponse({ status: 404, description: 'Organisation not found' })
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

  @Delete(':id/:roleId')
  @UseGuards(AuthGuard, OwnershipGuard)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Delete a role in an organisation' })
  @ApiParam({ name: 'organisationId', required: true, description: 'ID of the organisation' })
  @ApiResponse({ status: 200, description: 'Role successfully removed' })
  @ApiResponse({ status: 400, description: 'Invalid role ID format' })
  @ApiResponse({ status: 404, description: 'Role not found' })
  async remove(@Param('id') organisationId: string, @Param('roleId') roleId: string, @Req() req) {
    const currentUser = req.user;

    try {
      return await this.organisationRoleService.deleteRole(organisationId, roleId, currentUser);
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw new HttpException({ status_code: 404, error: 'Not Found', message: error.message }, HttpStatus.NOT_FOUND);
      }
      if (error instanceof BadRequestException) {
        throw new HttpException(
          { status_code: 400, error: 'Bad Request', message: error.message },
          HttpStatus.BAD_REQUEST
        );
      }
      if (error instanceof UnauthorizedException) {
        throw new HttpException(
          { status_code: 401, error: 'Unauthorized', message: error.message },
          HttpStatus.UNAUTHORIZED
        );
      }
      throw new HttpException(
        { status_code: 500, error: 'Internal Server Error', message: 'An unexpected error occurred' },
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }
}
