import { OrganisationMember } from '../../entities/org-members.entity';
import { organisationRoleMock } from './organisation-role.mock';
import { orgMock } from './organisation.mock';
import { profileMock } from './profile.mock';
import { mockUser } from './user.mock';

export const orgMemberMock: OrganisationMember = {
  id: 'member123',
  created_at: new Date(),
  updated_at: new Date(),
  user_id: mockUser,
  role: organisationRoleMock,
  organisation_id: orgMock,
  profile_id: profileMock,
  suspended: false,
  active_member: true,
  left_workspace: false,
  beforeSoftDeleteMember: () => {},
};
