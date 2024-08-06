import { Injectable, CanActivate, ExecutionContext, HttpStatus } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from '../modules/user/entities/user.entity';
import * as SYS_MSG from '../helpers/SystemMessages';
import { Organisation } from './../modules/organisations/entities/organisations.entity';
import { CustomHttpException } from '../helpers/custom-http-filter';

@Injectable()
export class MembershipGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    @InjectRepository(Organisation)
    private readonly organisationRepository: Repository<Organisation>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const organisationId = request.params.org_id;
    const userId = request.params.user_id;

    const organisation = await this.organisationRepository.findOne({
      where: { id: organisationId },
      relations: ['organisationMembers', 'organisationMembers.user_id'],
    });

    const user = await this.userRepository.findOne({
      where: { id: userId },
    });

    if (!organisation) {
      throw new CustomHttpException(SYS_MSG.ORG_NOT_FOUND, HttpStatus.NOT_FOUND);
    }
    if (!user) {
      throw new CustomHttpException(SYS_MSG.USER_NOT_FOUND, HttpStatus.NOT_FOUND);
    }
    if (organisation.organisationMembers.some(member => member.user_id.id == userId)) {
      return true;
    }
    throw new CustomHttpException(SYS_MSG.NOT_A_MEMBER, HttpStatus.FORBIDDEN);
  }
}
