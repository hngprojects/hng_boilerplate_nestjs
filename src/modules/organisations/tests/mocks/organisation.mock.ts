import { Organisation } from '../../entities/organisations.entity';
import { v4 as uuidv4 } from 'uuid';
import { Product } from '../../../products/entities/product.entity';
import { UserType } from '../../../user/entities/user.entity';

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
    user_type: UserType.ADMIN,
    products: [] as Product[],
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
  };
};

export const orgMock = createMockOrganisation();
