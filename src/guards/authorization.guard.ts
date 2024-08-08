import { Injectable, CanActivate, ExecutionContext, HttpStatus } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from '../modules/user/entities/user.entity';
import * as SYS_MSG from '../helpers/SystemMessages';
import { Organisation } from './../modules/organisations/entities/organisations.entity';
import { CustomHttpException } from '../helpers/custom-http-filter';
import { OrganisationUserRole } from '../modules/role/entities/organisation-user-role.entity';
import { Role } from '../modules/role/entities/role.entity';

@Injectable()
export class OwnershipGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    @InjectRepository(Organisation)
    private readonly organisationRepository: Repository<Organisation>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(OrganisationUserRole)
    private readonly organisationMembersRole: Repository<OrganisationUserRole>,
    @InjectRepository(Role)
    private readonly userRoleManager: Repository<Role>
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    return true;
    //   const request = context.switchToHttp().getRequest();
    //   const userId = request.user.sub;
    //   const user = this.userRepository.findOne({ where: { id: userId } });
    //   const organisationId = request.params.id;

    //   const organisation = await this.organisationRepository.findOne({
    //     where: { id: organisationId },
    //     relations: ['owner'],
    //   });

    //   if (!organisation) {
    //     throw new CustomHttpException(SYS_MSG.ORG_NOT_FOUND, HttpStatus.NOT_FOUND);
    //   }

    //   const userRole = (
    //     await this.organisationMembersRole.findOne({
    //       where: { userId, organisationId: organisation.id },
    //       relations: ['role'],
    //     })
    //   ).role;
    //   const isSuperAdmin = userRole.name === 'super-admin';
    //   if (isSuperAdmin) return true;

    //   if (organisation.owner.id === userId) {
    //     return true;
    //   }
    //   throw new CustomHttpException(SYS_MSG.NOT_ORG_OWNER, HttpStatus.FORBIDDEN);
    // }
  }
}
