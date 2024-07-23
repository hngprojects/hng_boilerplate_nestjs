import { Controller, Get, Post, Body, Patch, Param, Delete, HttpException } from '@nestjs/common';
import { OrganisationService } from './organisation.service';
import { CreateOrganisationDto } from './dto/create-organisation.dto';
import { UpdateOrganisationDto } from './dto/update-organisation.dto';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';

@ApiBearerAuth()
@ApiTags('Organisation')
@Controller('organisation')
export class OrganisationController {
  constructor(private readonly organisationService: OrganisationService) {}

  @Post()
  create(@Body() createOrganisationDto: CreateOrganisationDto) {
    return this.organisationService.create(createOrganisationDto);
  }

  @Get()
  findAll() {
    return this.organisationService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.organisationService.findOne(+id);
  }

  @ApiOperation({ summary: 'Update Organisation' })
  @ApiResponse({
    status: 200,
    description: 'The found record',
    type: UpdateOrganisationDto,
  })
  @Patch(':id')
  async update(@Param('id') id: string, @Body() updateOrganisationDto: UpdateOrganisationDto) {
    try {
      const updatedOrg = await this.organisationService.update(id, updateOrganisationDto);
      return { message: 'Product successfully updated', org: updatedOrg };
    } catch (error) {
      throw new HttpException(error.message, error.status || 500);
    }
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.organisationService.remove(+id);
  }
}
