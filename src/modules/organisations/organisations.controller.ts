import { Body, Controller, HttpException, Param, Patch, Post, Request, UseGuards } from '@nestjs/common';
import { OrganisationsService } from './organisations.service';
import { OrganisationRequestDto } from './dto/organisation.dto';
import { AuthGuard } from '@nestjs/passport';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { UpdateOrganisationDto } from './dto/update-organisation.dto';
import { skipAuth } from 'src/helpers/skipAuth';

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
    const updatedOrg = await this.organisationsService.update(id, updateOrganisationDto);
    return { message: 'Organisation successfully updated', org: updatedOrg };
  }
}
