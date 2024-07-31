import { Injectable, CanActivate, ExecutionContext, ForbiddenException, NotFoundException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { Organisation } from '../entities/organisations.entity';
import { UserType } from '../../user/entities/user.entity';

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
    const organisationId = request.params.id;

    if (user.user_type === UserType.SUPER_ADMIN) {
      return true;
    }

    const organisation = await this.organisationRepository.findOne({
      where: { id: organisationId },
      relations: ['owner', 'creator'],
    });

    if (!organisation) {
      throw new NotFoundException({
        status_code: 404,
        status: 'Not found Exception',
        message: 'Organisation member not found',
      });
    }

    if (organisation.owner.id === user.sub || organisation.creator.id === user.sub) {
      return true;
    }

    throw new ForbiddenException({
      status_code: 403,
      status: 'Forbidden Exception',
      message: 'You do not have permission to perform this action',
    });
  }
}
