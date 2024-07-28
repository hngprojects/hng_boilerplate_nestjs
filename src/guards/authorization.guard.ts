import { Injectable, CanActivate, ExecutionContext, ForbiddenException, NotFoundException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { UserType } from '../modules/user/entities/user.entity';
import { Organisation } from './../modules/organisations/entities/organisations.entity';
import { Job } from '../modules/jobs/entities/job.entity';

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
      throw new NotFoundException('Organisation not found');
    }
    if (organisation.owner.id === user.sub || organisation.creator.id === user.sub) {
      return true;
    }
    throw new ForbiddenException('You do not have permission to update this organisation');
  }
}

@Injectable()
export class JobGuard implements CanActivate {
  constructor(
    @InjectRepository(Job)
    private readonly jobRepository: Repository<Job>
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const user = request.user;
    const jobId = request.params.id;
    const job = await this.jobRepository.findOne({
      where: { id: jobId },
      relations: ['user'],
    });

    if (job.user.id === user.sub) {
      if (!job || job.is_deleted === true) throw new NotFoundException('Job not found');
      return true;
    } else {
      throw new ForbiddenException('You do not have permission to perform this action');
    }
  }
}
