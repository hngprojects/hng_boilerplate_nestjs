import { CanActivate, ExecutionContext, HttpStatus, Injectable } from '@nestjs/common';
import { User } from '../modules/user/entities/user.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { OrganisationMember } from 'src/modules/organisations/entities/org-members.entity';
import { Reflector } from '@nestjs/core';
import { PermissionCategory } from 'src/modules/organisation-permissions/helpers/PermissionCategory';
import { PERMISSIONS_KEY } from './permission.decorator';
import * as SYS_MSG from '../helpers/SystemMessages';
import { CustomHttpException } from 'src/helpers/custom-http-filter';

@Injectable()
export class OrganisationGuard implements CanActivate {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(OrganisationMember)
    private readonly membersRepository: Repository<OrganisationMember>,
    private readonly reflector: Reflector
  ) {}
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const requiredPermissions = this.reflector.getAllAndOverride<PermissionCategory[]>(PERMISSIONS_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    const request = context.switchToHttp().getRequest();
    const { id } = context.switchToHttp().getRequest().user;
    const org_id = request.params.id || request.params.org_id;

    const roles = await this.membersRepository.findOne({
      where: { user_id: { id: id }, organisation_id: { id: org_id } },
      relations: { role: { permissions: true }, organisation_id: true, user_id: true },
    });
    if (!roles) {
      throw new CustomHttpException(SYS_MSG.FORBIDDEN_ACTION, HttpStatus.FORBIDDEN);
    }
    const userHasPerms = requiredPermissions.every(requiredPermission => {
      return roles.role.permissions.some(permission => {
        return permission.category === requiredPermission && permission.permission_list === true;
      });
    });

    if (userHasPerms) {
      return true;
    } else {
      throw new CustomHttpException(SYS_MSG.FORBIDDEN_ACTION, HttpStatus.FORBIDDEN);
    }
  }
}
