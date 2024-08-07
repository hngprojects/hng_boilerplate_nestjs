import { Injectable, CanActivate, ExecutionContext, HttpStatus, BadRequestException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { UserType } from '../modules/user/entities/user.entity';
import * as SYS_MSG from '../helpers/SystemMessages';
import { Organisation } from './../modules/organisations/entities/organisations.entity';
import { CustomHttpException } from '../helpers/custom-http-filter';
import { isUUID } from 'class-validator';
import { BAD_REQUEST } from '../helpers/SystemMessages';

@Injectable()
export class OwnershipGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    @InjectRepository(Organisation)
    private readonly organisationRepository: Repository<Organisation>
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const user = request.user;
    const organisationId = request.params.id || request.params.org_id;

    if (!isUUID(organisationId)) {
      throw new CustomHttpException(SYS_MSG.ORG_NOT_FOUND, HttpStatus.BAD_REQUEST);
    }

    if (user.user_type === UserType.SUPER_ADMIN) {
      return true;
    }
    const organisation = await this.organisationRepository.findOne({
      where: { id: organisationId },
      relations: ['owner', 'creator'],
    });

    if (!organisation) {
      throw new CustomHttpException(SYS_MSG.ORG_NOT_FOUND, HttpStatus.NOT_FOUND);
    }
    if (
      organisation.owner.id === user.sub ||
      organisation.creator.id === user.sub ||
      organisation.owner.id === user.id ||
      organisation.creator.id === user.id
    ) {
      return true;
    }
    throw new CustomHttpException(SYS_MSG.NOT_ORG_OWNER, HttpStatus.FORBIDDEN);
  }
}
