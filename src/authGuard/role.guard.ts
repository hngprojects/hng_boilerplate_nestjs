import { Injectable, CanActivate, ExecutionContext, ForbiddenException, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY } from '../helpers/role.decorator';

@Injectable()
export class RoleGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private jwtService: JwtService
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const requiredRoles = this.reflector.get<string[]>(ROLES_KEY, context.getHandler());
    if (!requiredRoles || requiredRoles.length === 0) {
      return true; // No roles required, access allowed
    }

    const request = context.switchToHttp().getRequest();
    const user = request.user; // User attached by AuthGuard
    if (!user) {
      throw new ForbiddenException('Access denied');
    } else if (user && user.roleId === undefined) {
      throw new UnauthorizedException('User does not have required role');
    }

    const isRoleTrue = requiredRoles.includes(user.roleId);

    if (!isRoleTrue) {
      throw new UnauthorizedException('User does not have required role');
    }

    return true;
  }
}
