import { SetMetadata } from '@nestjs/common';
import { PermissionCategory } from 'src/modules/organisation-permissions/helpers/PermissionCategory';
export const PERMISSIONS_KEY = 'permissions';
export const Permissions = (...permissions: PermissionCategory[]) => SetMetadata(PERMISSIONS_KEY, permissions);
