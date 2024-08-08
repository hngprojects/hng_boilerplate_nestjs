import { CanActivate, ExecutionContext, HttpStatus, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { JwtService } from '@nestjs/jwt';
import { Request } from 'express';
import appConfig from '../../config/auth.config';
import { IS_PUBLIC_KEY } from '../helpers/skipAuth';
import * as SYS_MSG from '../helpers/SystemMessages';
import { CustomHttpException } from '../helpers/custom-http-filter';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    private jwtService: JwtService,
    private reflector: Reflector
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const token = this.extractTokenFromHeader(request);

    const isPublicRoute = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (isPublicRoute) {
      return true;
    }

    if (!token) {
      console.log('no token');
      throw new CustomHttpException(SYS_MSG.UNAUTHENTICATED_MESSAGE, HttpStatus.UNAUTHORIZED);
    }

    const payload = await this.jwtService
      .verifyAsync(token, {
        secret: appConfig().jwtSecret,
      })
      .catch(err => null);

    if (!payload) throw new CustomHttpException(SYS_MSG.UNAUTHENTICATED_MESSAGE, HttpStatus.UNAUTHORIZED);

    if (this.isExpiredToken(payload)) {
      throw new CustomHttpException(SYS_MSG.UNAUTHENTICATED_MESSAGE, HttpStatus.UNAUTHORIZED);
    }
    request['user'] = payload;
    request['token'] = token;

    return true;
  }

  private extractTokenFromHeader(request: Request): string | undefined {
    const [type, token] = request.headers.authorization?.split(' ') ?? [];
    return type === 'Bearer' ? token : undefined;
  }

  private isExpiredToken(token: any) {
    const currentTime = Math.floor(Date.now() / 1000);
    if (token.exp < currentTime) {
      return true;
    }
    return false;
  }
}
