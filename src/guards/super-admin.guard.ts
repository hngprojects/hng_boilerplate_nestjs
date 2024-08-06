import { Injectable, CanActivate, ExecutionContext, HttpStatus } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User, UserType } from '../modules/user/entities/user.entity';
import { Repository } from 'typeorm';
import * as SYS_MSG from '../helpers/SystemMessages';
import { CustomHttpException } from '../helpers/custom-http-filter';

@Injectable()
export class SuperAdminGuard implements CanActivate {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const { sub } = context.switchToHttp().getRequest().user;
    const user = await this.userRepository.findOne({ where: { id: sub } });

    if (user.user_type !== UserType.SUPER_ADMIN)
      throw new CustomHttpException(SYS_MSG.FORBIDDEN_ACTION, HttpStatus.FORBIDDEN);

    return true;
  }
}
