import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Observable } from 'rxjs';
import { User, UserType } from '../modules/user/entities/user.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

@Injectable()
export class OrganisationGuard implements CanActivate {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>
  ) {}
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const organisationId = request.params.id;

    const { sub } = context.switchToHttp().getRequest().user;
    const user = await this.userRepository.findOne({ where: { id: sub } });
    if (user.user_type === UserType.SUPER_ADMIN || UserType.ADMIN) {
      return true;
    }
    const isMember = user.organisationMembers.some(org => org.id === organisationId);
    return isMember;
  }
}
