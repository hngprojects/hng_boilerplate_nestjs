import { v4 as uuidv4 } from 'uuid';
import { DefaultPermissions } from '../../../../modules/organisation-permissions/entities/default-permissions.entity';
import { PermissionCategory } from '../../../../modules/organisation-permissions/helpers/PermissionCategory';

export const defaultOrganisationPermissionMock: DefaultPermissions = {
  id: uuidv4(),
  category: PermissionCategory.CanViewUsers,
  permission_list: false,
  created_at: new Date(),
  updated_at: new Date(),
};

export const defaultOrganisationPermissionMocks: DefaultPermissions[] = [
  {
    id: uuidv4(),
    category: PermissionCategory.CanViewUsers,
    permission_list: false,
    created_at: new Date(),
    updated_at: new Date(),
  },
  {
    id: uuidv4(),
    category: PermissionCategory.CanViewUsers,
    permission_list: false,
    created_at: new Date(),
    updated_at: new Date(),
  },
];
