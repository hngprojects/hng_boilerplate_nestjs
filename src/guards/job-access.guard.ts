import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Job } from '../modules/jobs/entities/job.entity';
import { User } from '@modules/user/entities/user.entity';

@Injectable()
export class JobAccessGuard implements CanActivate {
  constructor(
    @InjectRepository(Job)
    private readonly jobRepository: Repository<Job>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const jobId = request.params.id;
    const userId = request.user.sub;

    const user = await this.userRepository.findOne({
      where: { id: userId },
    });

    if (user?.is_superadmin) {
      return true;
    }

    const job = await this.jobRepository.findOne({
      where: { id: jobId },
      relations: ['user'],
    });

    if (!job) return false;
    return job.user.id === userId;
  }
}
