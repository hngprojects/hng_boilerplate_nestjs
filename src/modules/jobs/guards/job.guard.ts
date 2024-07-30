import { Injectable, CanActivate, ExecutionContext, ForbiddenException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Job } from '../entities/job.entity';
import { Repository } from 'typeorm';

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
