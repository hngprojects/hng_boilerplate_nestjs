import { User } from '../../../modules/user/entities/user.entity';
import { Invite } from '../entities/invite.entity';
import { mockOrg } from './mockOrg';

export const mockInvites: Invite[] = [
  {
    id: '1',
    created_at: new Date(),
    updated_at: new Date(),
    token: 'url',
    organisation: mockOrg,
    email: 'string',
    isGeneric: true,
    isAccepted: true,
    user: new User(),
  },
  {
    id: '2',
    created_at: new Date(),
    updated_at: new Date(),
    token: 'url',
    organisation: mockOrg,
    email: 'string',
    isGeneric: true,
    isAccepted: true,
    user: new User(),
  },
];
