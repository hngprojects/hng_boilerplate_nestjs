import { Body, Controller, Post, Request, UseGuards } from '@nestjs/common';
import { OrganisationsService } from './organisations.service';
import { OrganisationRequestDto } from './dto/organisation.dto';
import { AuthGuard } from '@nestjs/passport';

@Controller('organisations')
export class OrganisationsController {
  constructor(private readonly organisationsService: OrganisationsService) {}

  @UseGuards(AuthGuard('jwt'))
  @Post('/')
  async create(@Body() createOrganisationDto: OrganisationRequestDto, @Request() req) {
    const userId = req.user.userId;
    return this.organisationsService.create(createOrganisationDto, userId);
  }
}
