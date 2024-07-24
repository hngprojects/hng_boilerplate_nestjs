import {
  Body,
  Controller,
  Param,
  Get,
  Patch,
  Post,
  Request,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { OrganisationsService } from './organisations.service';
import { OrganisationRequestDto } from './dto/organisation.dto';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { UpdateOrganisationDto } from './dto/update-organisation.dto';

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
  @Patch(':id')
  async update(@Param('id') id: string, @Body() updateOrganisationDto: UpdateOrganisationDto) {
    const updatedOrg = await this.organisationsService.updateOrganisation(id, updateOrganisationDto);
    return { message: 'Organisation successfully updated', org: updatedOrg };
  }

  @ApiOperation({ summary: 'Get Organisation by ID' })
  @ApiResponse({
    status: 200,
    description: 'The found record',
  })
  @Get(':id')
  async getOrganisationById(@Param('id') id: string, @Request() req) {
    const user = req['user'];
    const organisation = await this.organisationsService.getOrganisationById(id, user.sub);
    if (!organisation) {
      throw new NotFoundException('Organisation not found');
    }
    return organisation;
  }
}
