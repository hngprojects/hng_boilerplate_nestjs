import { UpdatePermissionDto } from '../dto/update-permission.dto';

export const mockUpdatePermissionDto = {
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
