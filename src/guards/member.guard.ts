import { Injectable, CanActivate, ExecutionContext, HttpStatus } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import * as SYS_MSG from '../helpers/SystemMessages';
import { Organisation } from './../modules/organisations/entities/organisations.entity';
import { CustomHttpException } from '../helpers/custom-http-filter';
import { OrganisationMember } from '../modules/organisations/entities/org-members.entity';
import { PermissionCategory } from '../modules/organisation-permissions/helpers/PermissionCategory';
import { PERMISSIONS_KEY } from './permission.decorator';

@Injectable()
export class MembershipGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    @InjectRepository(Organisation)
    private readonly organisationRepository: Repository<Organisation>,
    @InjectRepository(OrganisationMember)
    private readonly membersRepository: Repository<OrganisationMember>
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const currentUserId = request.user.sub;
    const organisationId = request.params.org_id;

    const requiredPermissions = this.reflector.getAllAndOverride<PermissionCategory[]>(PERMISSIONS_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    const organisation = await this.organisationRepository.findOne({
      where: { id: organisationId },
      relations: ['owner', 'creator', 'organisationMembers', 'organisationMembers.user_id'],
    });

    if (!organisation) {
      throw new CustomHttpException(SYS_MSG.ORG_NOT_FOUND, HttpStatus.NOT_FOUND);
    }

    if (organisation.owner.id === currentUserId || organisation.creator.id === currentUserId) return true;

    const roles = await this.membersRepository.findOne({
      where: { user_id: currentUserId },
      relations: { role: true, organisation_id: true, user_id: true },
    });

    const userHasPerms = roles.role.permissions.some(permission => {
      return requiredPermissions.includes(permission.category);
    });

    if (userHasPerms) {
      return true;
    } else {
      throw new CustomHttpException(SYS_MSG.FORBIDDEN_ACTION, HttpStatus.FORBIDDEN);
    }
  }
}
