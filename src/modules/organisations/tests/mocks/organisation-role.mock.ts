import { OrganisationRole } from '../../../organisation-role/entities/organisation-role.entity';
import { v4 as uuidv4 } from 'uuid';

export const organisationRoleMock: OrganisationRole = {
  id: uuidv4(),
  name: 'Admin',
  description: 'Administrator role with full permissions',
  permissions: [],
  organisation: null,
  organisationMembers: [],
  created_at: new Date(),
  updated_at: new Date(),
};

export const organisationRoleMocks: OrganisationRole[] = [
  {
    id: uuidv4(),
    name: 'Admin',
    description: 'Administrator role with full permissions',
    permissions: [],
    organisation: null,
    organisationMembers: [],
    created_at: new Date(),
    updated_at: new Date(),
  },
];
