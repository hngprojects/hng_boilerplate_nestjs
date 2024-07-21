import { Injectable, CanActivate, ExecutionContext, NotFoundException } from '@nestjs/common';
import { OrganizationService } from '../organization.service';

@Injectable()
export class OrganizationGuard implements CanActivate {
  constructor(private readonly organizationService: OrganizationService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const { orgId } = request.params;

    const organization = await this.organizationService.getOrganizationById(orgId);
    if (!organization) {
      throw new NotFoundException('Organization not found');
    }

    return true;
  }
}
