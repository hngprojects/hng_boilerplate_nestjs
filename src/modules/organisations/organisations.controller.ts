import {
  Body,
  Controller,
  DefaultValuePipe,
  Delete,
  Get,
  InternalServerErrorException,
  NotFoundException,
  Param,
  ParseIntPipe,
  ParseUUIDPipe,
  Patch,
  Post,
  Put,
  Query,
  Req,
  Res,
  UseGuards,
  Logger,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { OwnershipGuard } from '../../guards/authorization.guard';
import { OrganisationMembersResponseDto } from './dto/org-members-response.dto';
import { OrganisationRequestDto } from './dto/organisation.dto';
import { OrganisationsService } from './organisations.service';
import { UpdateOrganisationDto } from './dto/update-organisation.dto';
import { UpdateMemberRoleDto } from './dto/update-organisation-role.dto';
import { RemoveOrganisationMemberDto } from './dto/org-member.dto';
import { UserOrganizationErrorResponseDto, UserOrganizationResponseDto } from './dto/user-orgs-response.dto';
import { AddMemberDto } from './dto/add-member.dto';
import { Response } from 'express';
import { createReadStream } from 'fs';
import { pipeline } from 'stream/promises';
import { unlink } from 'fs/promises';

@ApiBearerAuth()
@ApiTags('Organization')
@Controller('organizations')
export class OrganisationsController {
  private readonly logger = new Logger(OrganisationsController.name);
  constructor(private readonly organisationsService: OrganisationsService) {}

  @ApiOperation({ summary: 'Create new Organisation' })
  @ApiResponse({
    status: 201,
    description: 'The created organisation',
  })
  @ApiResponse({
    status: 409,
    description: 'Organisation email already exists',
  })
  @Post('/')
  async create(@Body() createOrganisationDto: OrganisationRequestDto, @Req() req) {
    const user = req['user'];
    return this.organisationsService.create(createOrganisationDto, user.sub);
  }
  @UseGuards(OwnershipGuard)
  @Delete(':org_id')
  async delete(@Param('org_id') id: string, @Res() response: Response) {
    this.organisationsService;
    return this.organisationsService.deleteorganisation(id);
  }

  @ApiOperation({ summary: 'Update Organisation' })
  @ApiResponse({
    status: 200,
    description: 'Organisation updated successfully',
  })
  @ApiResponse({
    status: 400,
    description: 'Bad request',
  })
  @ApiResponse({
    status: 401,
    description: 'User is currently not authorized, kindly authenticate to continue',
  })
  @ApiResponse({
    status: 403,
    description: 'You do not have permission to update this organisation',
  })
  @ApiResponse({
    status: 404,
    description: 'Organisation not found',
  })
  @UseGuards(OwnershipGuard)
  @Patch(':orgId')
  async update(@Param('orgId') orgId: string, @Body() updateOrganisationDto: UpdateOrganisationDto) {
    return await this.organisationsService.updateOrganisation(orgId, updateOrganisationDto);
  }

  @ApiOperation({ summary: 'Get members of an Organisation' })
  @ApiResponse({
    status: 200,
    description: 'The found record',
    type: OrganisationMembersResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: 'Organisation not found',
  })
  @ApiResponse({
    status: 403,
    description: 'User not a member of the organisation',
  })
  @Get(':org_id/users')
  async getMembers(
    @Req() req,
    @Param('org_id') org_id: string,
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('page_size', new DefaultValuePipe(1), ParseIntPipe) page_size: number
  ): Promise<OrganisationMembersResponseDto> {
    const { sub } = req.user;
    return this.organisationsService.getOrganisationMembers(org_id, page, page_size, sub);
  }

  @ApiOperation({ summary: 'Assign roles to members of an organisation' })
  @ApiResponse({
    status: 200,
    description: 'Assign roles to members of an organisation',
    schema: {
      properties: {
        status: { type: 'string' },
        message: { type: 'string' },
        data: {
          type: 'object',
          properties: {
            user: { type: 'string' },
            org: { type: 'string' },
            role: { type: 'string' },
          },
        },
      },
    },
  })
  @ApiResponse({
    status: 404,
    description: 'Organisation not found',
  })
  @ApiResponse({
    status: 403,
    description: 'User not a member of the organisation',
  })
  @Put(':org_id/users/:user_id/role')
  async updateMemberRole(
    @Param('user_id') memberId: string,
    @Param('org_id') orgId: string,
    @Body() updateMemberRoleDto: UpdateMemberRoleDto
  ) {
    return await this.organisationsService.updateMemberRole(orgId, memberId, updateMemberRoleDto);
  }
}
