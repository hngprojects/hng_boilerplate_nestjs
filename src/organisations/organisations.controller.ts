import { Controller, Get, Param, NotFoundException, BadRequestException } from '@nestjs/common';
import { OrganisationsService } from './organisations.service';
import { Organisation } from '../entities/organisation.entity';

@Controller('api/v1/organisations')
export class OrganisationsController {
  constructor(private readonly organisationsService: OrganisationsService) {}

  @Get(':orgId')
  async getOrganisationById(
    @Param('orgId') orgId: string
  ): Promise<{ status: string; status_code: number; data?: Organisation; message?: string }> {
    if (!orgId) {
      throw new BadRequestException('Valid organisation ID must be provided');
    }

    const organisation = await this.organisationsService.findById(orgId);
    if (!organisation) {
      throw new NotFoundException('Organisation not found');
    }

    return {
      status: 'success',
      status_code: 200,
      data: organisation,
    };
  }
}
