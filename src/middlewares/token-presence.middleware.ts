import { Injectable, NestMiddleware, UnauthorizedException } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';

@Injectable()
export class TokenPresenceMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    const token = req.headers.authorization;

    if (!token) {
      throw new UnauthorizedException({
        status: false,
        status_code: 401,
        error: 'AuthorizationError',
        message: 'Authorization token is required',
      });
    }

    next();
  }
}
