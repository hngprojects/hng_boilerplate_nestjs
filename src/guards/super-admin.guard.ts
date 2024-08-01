import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User, UserType } from '../modules/user/entities/user.entity';
import { Repository } from 'typeorm';
import { FORBIDDEN_ACTION } from '../helpers/SystemMessages';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const { sub } = context.switchToHttp().getRequest().user;
    const user = await this.userRepository.findOne({ where: { id: sub } });
    if (user.user_type !== UserType.SUPER_ADMIN) throw new ForbiddenException(FORBIDDEN_ACTION);
    return true;
  }
}
