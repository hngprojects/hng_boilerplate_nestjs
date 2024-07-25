import { Session } from '../../../session/entities/session.entity';
import { Organisation } from '../../entities/organisations.entity';
import { v4 as uuidv4 } from 'uuid';

export enum UserType {
  SUPER_ADMIN = 'super_admin',
  ADMIN = 'admin',
  USER = 'vendor',
}

export const createMockOrganisation = (): Organisation => {
  const ownerAndCreator = {
    id: uuidv4(),
    created_at: new Date(),
    updated_at: new Date(),
    first_name: 'John',
    last_name: 'Smith',
    email: 'john.smith@example.com',
    password: 'pass123',
    hashPassword: async () => {},
    is_active: true,
    attempts_left: 3,
    time_left: 3600,
    owned_organisations: [],
    created_organisations: [],
    invites: [],
    user_type: UserType.ADMIN,
    sessions: [] as Session[],
    secret: 'secret',
    is_2fa_enabled: false,
  };

  return {
    id: uuidv4(),
    name: 'John & Co',
    description: 'An imports organisation',
    email: 'johnCo@example.com',
    industry: 'Import',
    type: 'General',
    country: 'Nigeria',
    address: 'Street 101 Building 26',
    state: 'Lagos',
    owner: ownerAndCreator,
    creator: { ...ownerAndCreator, user_type: UserType.USER },
    created_at: new Date(),
    updated_at: new Date(),
    isDeleted: false,
    preferences: [],
    invites: [],
  };
};

export const orgMock = createMockOrganisation();
