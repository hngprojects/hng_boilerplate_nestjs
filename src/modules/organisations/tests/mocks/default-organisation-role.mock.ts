import { RoleCategory } from '../../../../modules/organisation-role/helpers/RoleCategory';
import { DefaultRole } from '../../../../modules/organisation-role/entities/role.entity';

import { v4 as uuidv4 } from 'uuid';

export const defaultOrganisationRoleMock: DefaultRole = {
  id: uuidv4(),
  name: RoleCategory.Administrator,
  description: 'Administrator role with full permissions',
  created_at: new Date(),
  updated_at: new Date(),
};

export const defaultOrganisationRoleMocks: DefaultRole[] = [
  {
    id: uuidv4(),
    name: RoleCategory.Administrator,
    description: 'Administrator role with full permissions',
    created_at: new Date(),
    updated_at: new Date(),
  },
  {
    id: uuidv4(),
    name: RoleCategory.Administrator,
    description: 'Administrator role with full permissions',
    created_at: new Date(),
    updated_at: new Date(),
  },
];
