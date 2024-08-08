import { Organisation } from '../../organisations/entities/organisations.entity';
import { mockUser } from './mockUser';

export const mockOrg: Organisation = {
  id: 'some-random-id',
  created_at: new Date(),
  updated_at: new Date(),
  name: 'Org 1',
  description: 'Description 1',
  email: 'test1@email.com',
  industry: 'industry1',
  type: 'type1',
  country: 'country1',
  address: 'address1',
  state: 'state1',
  isDeleted: false,
  owner: mockUser,
  preferences: [],
  invites: [],
  products: [],
  members: [],
  roles: [],
};
