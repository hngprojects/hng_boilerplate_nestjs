// src/auth/roles.decorator.ts
import { SetMetadata } from '@nestjs/common';
import { Roles } from './roles.enum';

export const ROLES_KEY = 'roles';
export const Role = (...roles: Roles[]) => SetMetadata(ROLES_KEY, roles);
