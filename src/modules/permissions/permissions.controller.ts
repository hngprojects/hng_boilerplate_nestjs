import {
  Body,
  Controller,
  Get,
  HttpException,
  HttpStatus,
  InternalServerErrorException,
  NotFoundException,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { OwnershipGuard } from '../../guards/authorization.guard';
import { UpdatePermissionDto } from './dto/update-permission.dto';
import { OrganisationPermissionsService } from './permissions.service';
import { CreatePermissionDto } from './dto/create-permission.dto';

@ApiBearerAuth()
@ApiTags('Organisation Permissions')
@Controller('')
export class OrganisationPermissionsController {
  constructor(private readonly permissionService: OrganisationPermissionsService) {}

  @ApiOperation({ summary: 'Create Permission' })
  @ApiResponse({
    status: 200,
    description: 'Create a new existing permission',
    type: CreatePermissionDto,
  })
  // @UseGuards(OwnershipGuard)
  @Post('permissions')
  async createPermission(@Body() createPermissionDto: CreatePermissionDto) {
    return await this.permissionService.createPermission(createPermissionDto.title);
  }

  @ApiOperation({ summary: 'Create Permission' })
  @ApiResponse({
    status: 200,
    description: 'Create a new existing permission',
    type: CreatePermissionDto,
  })
  @Patch('permissions/:permission_id')
  async updatePermission(@Body() updatePermissionDto: UpdatePermissionDto, @Param('permission_id') id: string) {
    return await this.permissionService.updatePermission({ id, permission: updatePermissionDto });
  }

  @ApiOperation({ summary: 'Fetch all Permission' })
  @Get('permissions')
  async getAllPermissions() {
    return await this.permissionService.getAllPermissions();
  }

  @ApiOperation({ summary: 'Fetch all Permission' })
  @Get('permissions/:permission_id')
  async getSinglePermission(@Param('permission_id') id: string) {
    return await this.permissionService.getSinglePermission(id);
  }
}
