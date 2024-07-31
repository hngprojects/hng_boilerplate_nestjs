import {
  Body,
  Controller,
  HttpException,
  HttpStatus,
  InternalServerErrorException,
  NotFoundException,
  Param,
  Patch,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { OwnershipGuard } from '../../guards/authorization.guard';
import { UpdatePermissionDto } from './dto/update-permission.dto';
import { OrganisationPermissionsService } from './organisation-permissions.service';

@ApiBearerAuth()
@ApiTags('Organisation Permissions')
@Controller('organizations')
export class OrganisationPermissionsController {
  constructor(private readonly permissionService: OrganisationPermissionsService) {}

  @ApiOperation({ summary: 'Update Permission' })
  @ApiResponse({
    status: 200,
    description: 'The found record',
    type: UpdatePermissionDto,
  })
  @UseGuards(OwnershipGuard)
  @Patch(':org_id/:role_id/permissions')
  async updatePermission(
    @Param('org_id') org_id: string,
    @Param('role_id') role_id: string,
    @Body() updatePermissionsDto: UpdatePermissionDto
  ) {
    try {
      return await this.permissionService.handleUpdatePermission(org_id, role_id, updatePermissionsDto);
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw new HttpException(error.message, HttpStatus.NOT_FOUND);
      } else if (error instanceof InternalServerErrorException) {
        throw new HttpException(error.message, HttpStatus.INTERNAL_SERVER_ERROR);
      } else {
        throw new HttpException('An unexpected error occurred', HttpStatus.INTERNAL_SERVER_ERROR);
      }
    }
  }
}
