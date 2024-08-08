import { Injectable, CanActivate, ExecutionContext, HttpStatus } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import * as SYS_MSG from '../helpers/SystemMessages';
import { Organisation } from './../modules/organisations/entities/organisations.entity';
import { CustomHttpException } from '../helpers/custom-http-filter';
import { PermissionCategory } from '../modules/permissions/helpers/PermissionCategory';
import { PERMISSIONS_KEY } from './permission.decorator';
import { OrganisationUserRole } from '../modules/role/entities/organisation-user-role.entity';
import { Role } from '../modules/role/entities/role.entity';

@Injectable()
export class MembershipGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    @InjectRepository(Organisation)
    private readonly organisationRepository: Repository<Organisation>,
    @InjectRepository(OrganisationUserRole)
    private readonly organisationMembersRole: Repository<OrganisationUserRole>,
    @InjectRepository(Role)
    private readonly userRoleManager: Repository<Role>
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const currentUserId = request.user.sub;

    const organisationId = request.params.org_id;
    const adminRole = await this.userRoleManager.findOne({
      where: { name: 'member' },
      relations: ['permissions'],
    });
    const requiredPermissions = adminRole.permissions.map(permission => permission.title);

    const organisation = await this.organisationRepository.findOne({
      where: { id: organisationId },
      relations: ['owner'],
    });

    if (!organisation) {
      throw new CustomHttpException(SYS_MSG.ORG_NOT_FOUND, HttpStatus.NOT_FOUND);
    }

    if (organisation.owner.id === currentUserId) return true;

    const userRole = (
      await this.organisationMembersRole.findOne({
        where: {
          organisation: { id: organisation.id },
          user: { id: currentUserId },
        },
        relations: ['role', 'role.permissions'],
      })
    ).role;

    const userHasPerms = userRole.permissions.some(permission => {
      return requiredPermissions.includes(permission.title);
    });

    if (userHasPerms) {
      return true;
    } else {
      throw new CustomHttpException(SYS_MSG.FORBIDDEN_ACTION, HttpStatus.FORBIDDEN);
    }
  }
}
