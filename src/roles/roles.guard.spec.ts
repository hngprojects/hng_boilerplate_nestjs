import { Reflector } from '@nestjs/core';
import { RolesGuard } from './roles.guard';
import { ExecutionContext, ForbiddenException } from '@nestjs/common';

describe('RolesGuard', () => {
  let guard: RolesGuard;
  let reflector: Reflector;

  beforeEach(() => {
    reflector = new Reflector();
    guard = new RolesGuard(reflector);
  });

  it('should allow access if roles match', () => {
    jest.spyOn(reflector, 'get').mockReturnValue(['admin']);
    const context = {
      switchToHttp: () => ({
        getRequest: () => ({
          user: { role: 'admin' },
        }),
      }),
      getHandler: jest.fn(),
    } as unknown as ExecutionContext;

    expect(guard.canActivate(context)).toBe(true);
  });

  it('should deny access if roles do not match', () => {
    jest.spyOn(reflector, 'get').mockReturnValue(['admin']);
    const context = {
      switchToHttp: () => ({
        getRequest: () => ({
          user: { role: 'user' },
        }),
      }),
      getHandler: jest.fn(),
    } as unknown as ExecutionContext;

    expect(() => guard.canActivate(context)).toThrow(ForbiddenException);
  });
});
