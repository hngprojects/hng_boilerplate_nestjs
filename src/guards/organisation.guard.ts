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
    const user = await this.userRepository.findOne({
      where: { id: sub },
      relations: ['owned_organisations', 'created_organisations', 'organisationMembers'],
    });

    if (!user) {
      return false;
    }
    // check if user is admin or super admin
    if (user.user_type === UserType.SUPER_ADMIN || user.user_type === UserType.ADMIN) {
      return true;
    }

    // check if user owns the organisation
    const isOwner = user.owned_organisations.some(org => org.id === organisationId);
    if (isOwner) return true;

    // check if user is the creator of the organisation
    const isCreator = user.created_organisations.some(org => org.id === organisationId);
    if (isCreator) return true;

    // check if user is a member of the organisation
    const isMember = user.organisationMembers.some(org => org.id === organisationId);
    return isMember;
  }
}
