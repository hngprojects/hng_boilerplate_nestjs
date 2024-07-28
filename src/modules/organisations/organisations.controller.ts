import { Body, Controller, Param, Patch, Post, Request, UseGuards } from '@nestjs/common';
import { OrganisationsService } from './organisations.service';
import { OrganisationRequestDto } from './dto/organisation.dto';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { UpdateOrganisationDto } from './dto/update-organisation.dto';
import { AddUserToOrganisationDto } from './dto/add-user-dto';
import { OwnershipGuard } from '../../guards/authorization.guard';

@ApiBearerAuth()
@ApiTags('Organisation')
@Controller('organisations')
export class OrganisationsController {
  constructor(private readonly organisationsService: OrganisationsService) {}

  @Post('/')
  async create(@Body() createOrganisationDto: OrganisationRequestDto, @Request() req) {
    const user = req['user'];
    return this.organisationsService.create(createOrganisationDto, user.sub);
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

  @ApiOperation({ summary: 'Add User To Organisation' })
  @Post('/:org_id/users')
  async addUser(@Param('org_id') orgId: string, @Body() addUserDto: AddUserToOrganisationDto, @Request() req) {
    const userId = addUserDto.userId;
    const currentUser = req['user'];
    return this.organisationsService.addUser(orgId, userId, currentUser.sub);
  }
}
