// src/auth/role.guard.ts
import { Injectable, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Roles } from './roles.enum';
import { ROLES_KEY } from './roles.decorator';

@Injectable()
export class RoleGuard {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<Roles[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!requiredRoles) {
      return true; // If no roles are specified, access is allowed.
    }

    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (!user || !requiredRoles.some(role => user.roles.includes(role))) {
      throw new ForbiddenException('You do not have the required roles');
    }

    return true;
  }
}
