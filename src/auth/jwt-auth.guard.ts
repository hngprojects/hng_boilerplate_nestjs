import { Injectable, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Response } from 'express';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  canActivate(context: ExecutionContext): boolean {
    return super.canActivate(context) as boolean;
  }

  handleRequest(err, user, info, context: ExecutionContext) {
    const request = context.switchToHttp().getRequest();
    const response = context.switchToHttp().getResponse<Response>();

    if (err || !user) {
      response.status(401).json({
        status_code: 401,
        message: 'Unauthorized',
        error: 'Unauthorized',
      });
      return null;
    }

    request.user = user;
    return user;
  }
}
