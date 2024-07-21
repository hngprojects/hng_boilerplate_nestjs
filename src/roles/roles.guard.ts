import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const roles = this.reflector.get<string[]>('roles', context.getHandler());
    if (!roles) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (!user) {
      throw new ForbiddenException({
        status_code: 401,
        error: 'Unauthorized',
        message: 'No user information found in request',
      });
    }

    const hasRole = () => roles.includes(user.role);
    if (!hasRole()) {
      throw new ForbiddenException({
        status_code: 403,
        error: 'Unauthorized',
        message: 'You do not have admin rights for this organization',
      });
    }

    return true;
  }
}
