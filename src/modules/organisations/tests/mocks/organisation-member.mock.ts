import { OrganisationMember } from '../../entities/org-members.entity';
import { organisationRoleMock } from './organisation-role.mock';
import { profileMock } from './profile.mock';

export const orgMemberMock: OrganisationMember = {
  id: 'member123',
  created_at: new Date(),
  updated_at: new Date(),
  user_id: null,
  role: organisationRoleMock,
  organisation_id: null,
  profile_id: profileMock,
};
