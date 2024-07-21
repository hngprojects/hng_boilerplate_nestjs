import { Provider } from '@nestjs/common';
import { AuthGuard } from './jwt-auth.guard';
// import { JwtService } from 'src/modules/auth/jwt/jwt.service';
import { Reflector } from '@nestjs/core';
import { JwtService } from '@nestjs/jwt';

export const authGuardProvider: Provider = {
  provide: AuthGuard,
  useFactory: (jwtService: JwtService, reflector: Reflector) => new AuthGuard(jwtService, reflector),
  inject: [JwtService, Reflector],
};
