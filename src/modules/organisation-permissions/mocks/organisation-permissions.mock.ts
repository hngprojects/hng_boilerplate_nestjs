import { Role } from '../../organisation-role/entities/role.entity';
import { Organisation } from '../../organisations/entities/organisations.entity';
import { UpdatePermissionDto } from '../dto/update-permission.dto';

export const mockOrganisation = {
  id: 'org_123',
  name: 'Test Organization',
  role: [
    {
      id: 'role_456',
      name: 'Admin',
      permissions: [
        { id: 'perm_1', category: ' canViewTransactions', permission_list: true },
        { id: 'perm_2', category: 'canViewRefunds', permission_list: true },
        { id: 'perm_3', category: 'canLogRefunds', permission_list: true },
        { id: 'perm_4', category: 'canViewUsers', permission_list: true },
        { id: 'perm_5', category: 'canCreateUsers', permission_list: true },
        { id: 'perm_6', category: 'canEditUsers', permission_list: true },
        { id: 'perm_7', category: 'canBlacklistWhitelistUsers', permission_list: true },
      ],
    },
  ],
} as Organisation;

export const mockRole = {
  id: 'role_456',
  name: 'Admin',
  permissions: [
    { id: 'perm_1', category: 'canViewTransactions', permission_list: true },
    { id: 'perm_2', category: 'canViewRefunds', permission_list: true },
    { id: 'perm_3', category: 'canLogRefunds', permission_list: true },
    { id: 'perm_4', category: 'canViewUsers', permission_list: true },
    { id: 'perm_5', category: 'canCreateUsers', permission_list: true },
    { id: 'perm_6', category: 'canEditUsers', permission_list: true },
    { id: 'perm_7', category: 'canBlacklistWhitelistUsers', permission_list: true },
  ],
} as Role;

export const mockUpdatePermissionDto: UpdatePermissionDto = {
  permission_list: {
    canViewTransactions: true,
    canViewRefunds: true,
    canLogRefunds: false,
    canViewUsers: true,
    canCreateUsers: false,
    canEditUsers: true,
    canBlacklistWhitelistUsers: false,
  },
};
