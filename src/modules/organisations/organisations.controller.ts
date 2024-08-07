import {
  Body,
  Controller,
  DefaultValuePipe,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiParam, ApiResponse, ApiTags } from '@nestjs/swagger';
import { OwnershipGuard } from '../../guards/authorization.guard';
import { OrganisationMembersResponseDto } from './dto/org-members-response.dto';
import { OrganisationRequestDto } from './dto/organisation.dto';
import { UpdateOrganisationDto } from './dto/update-organisation.dto';
import { OrganisationsService } from './organisations.service';
import { RemoveOrganisationMemberDto } from './dto/org-member.dto';
import { UserOrganizationErrorResponseDto, UserOrganizationResponseDto } from './dto/user-orgs-response.dto';
import { AddMemberDto } from './dto/add-member.dto';

@ApiBearerAuth()
@ApiTags('organization')
@Controller('organizations')
export class OrganisationsController {
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
    description: 'The found record',
    type: UpdateOrganisationDto,
  })
  @UseGuards(OwnershipGuard)
  @Patch(':id')
  async update(@Param('id') id: string, @Body() updateOrganisationDto: UpdateOrganisationDto) {
    const updatedOrg = await this.organisationsService.updateOrganisation(id, updateOrganisationDto);
    return { message: 'Organisation successfully updated', org: updatedOrg };
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

  @UseGuards(OwnershipGuard)
  @Delete(':organizatonId/members/:userId')
  @ApiOperation({ summary: 'Gets a product by id' })
  @ApiParam({ name: 'id', description: 'Organization ID', example: '12345' })
  @ApiResponse({ status: 200, description: 'Member removed successfully' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 404, description: 'Product not found' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  async removeOrganisationMember(@Param() params: RemoveOrganisationMemberDto) {
    return this.organisationsService.removeOrganisationMember(params);
  }

  @UseGuards(OwnershipGuard)
  @ApiOperation({ summary: 'Add member to an organization' })
  @ApiResponse({
    status: 201,
    description: 'Member added successfully',
  })
  @ApiResponse({
    status: 409,
    description: 'User already added to organization.',
  })
  @ApiResponse({
    status: 404,
    description: 'Organisation not found',
  })
  @Post(':org_id/users')
  async addMember(@Param('org_id', ParseUUIDPipe) org_id: string, @Body() addMemberDto: AddMemberDto) {
    return this.organisationsService.addOrganisationMember(org_id, addMemberDto);
  }

  @ApiOperation({ summary: "Gets a user's organizations" })
  @ApiResponse({
    status: 200,
    description: 'Organisations retrieved successfully',
    type: UserOrganizationResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Bad request',
    type: UserOrganizationErrorResponseDto,
  })
  @Get('/')
  async getUserOrganisations(@Req() req) {
    const { sub } = req.user;
    return this.organisationsService.getUserOrganisations(sub);
  }

  @ApiOperation({ summary: 'Get Organization details by Id' })
  @ApiResponse({
    status: 200,
    description: 'Fetched Organization details',
  })
  @ApiResponse({
    status: 400,
    description: 'Must provide a valid organization Id',
  })
  @ApiResponse({
    status: 404,
    description: 'Organization not found',
  })
  @Get(':org_id')
  async getById(@Param('org_id') org_id: string) {
    return this.organisationsService.getOrganizationDetailsById(org_id);
  }
}
