import { Injectable, CanActivate, ExecutionContext, HttpStatus } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User, UserType } from '../modules/user/entities/user.entity';
import { Repository } from 'typeorm';
import * as SYS_MSG from '../helpers/SystemMessages';
import { CustomHttpException } from '../helpers/custom-http-filter';
import { Organisation } from '../modules/organisations/entities/organisations.entity';
import { OrganisationUserRole } from '../modules/role/entities/organisation-user-role.entity';
import { Role } from '../modules/role/entities/role.entity';

@Injectable()
export class SuperAdminGuard implements CanActivate {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
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
      where: { name: 'super-admin' },
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
        where: { organisationId: organisation.id, userId: currentUserId },
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
