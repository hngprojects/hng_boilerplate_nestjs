import { InviteDto } from '../dto/invite.dto';
import { mockOrg } from './mockOrg';

export const mockInvitesResponse: InviteDto[] = [
  {
    id: '1',
    token: 'url',
    organisation: mockOrg,
    email: 'string',
    isGeneric: true,
    isAccepted: true,
  },
  {
    id: '2',
    token: 'url',
    organisation: mockOrg,
    email: 'string',
    isGeneric: true,
    isAccepted: true,
  },
];
