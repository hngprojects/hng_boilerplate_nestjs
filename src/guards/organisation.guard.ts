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

    const { sub } = context.switchToHttp().getRequest().user;
    const roles = await this.membersRepository.findOne({
      where: { user_id: sub },
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
