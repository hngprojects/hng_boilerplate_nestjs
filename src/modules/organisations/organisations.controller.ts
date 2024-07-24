import { Body, Controller, Post, Request, Param, Delete } from '@nestjs/common';
import { OrganisationsService } from './organisations.service';
import { OrganisationRequestDto } from './dto/organisation.dto';
import { AuthGuard } from '@nestjs/passport';

@Controller('organisations')
export class OrganisationsController {
  constructor(private readonly organisationsService: OrganisationsService) {}

  @Post('/')
  async create(@Body() createOrganisationDto: OrganisationRequestDto, @Request() req) {
    const user = req['user'];
    return this.organisationsService.create(createOrganisationDto, user.sub);
  }

  @Delete('/:org_id/users/:user_id')
  async removeUser(@Param('org_id') orgId: string, @Param('user_id') userId: string, @Request() req) {
    const currentUser = req['user'];
    return this.organisationsService.removeUser(orgId, userId, currentUser.sub);
  }
}
