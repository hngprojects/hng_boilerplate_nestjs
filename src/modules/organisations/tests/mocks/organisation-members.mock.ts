import { Profile } from '../../../profile/entities/profile.entity';
import { OrganisationMember } from '../../entities/org-members.entity';
import { User } from '../../../user/entities/user.entity';

let memberCounter = 0;
const createOrgMemberMock = (
  firstName: string,
  lastName: string,
  username: string,
  suspended: boolean,
  active_member: boolean,
  left_workspace: boolean
) => {
  const createProfileMock = (username: string) => {
    return {
      id: `uuid-${memberCounter}-profile`,
      username: 'mockuser',
      profile_pic_url: '',
    } as unknown as Profile;
  };

  const createUserMock = (firstName: string, lastName: string) => {
    return {
      id: `user-${memberCounter++}-uuid`,
      first_name: firstName,
      last_name: lastName,
      email: `${firstName.toLowerCase()}${lastName.toLowerCase()}@org.com`,
      phone: '0893',
    } as unknown as User;
  };

  return {
    user_id: createUserMock(firstName, lastName),
    profile_id: createProfileMock(username),
    organisation_id: { id: 'some-org-uuid' },
    suspended,
    active_member,
    left_workspace,
  } as unknown as OrganisationMember;
};

export const organisationMembersMocks = [
  createOrgMemberMock('Jane', 'Smith', 'janesit', false, true, false),
  createOrgMemberMock('Boluwatito', 'Rambo', 'joelastman', false, false, true),
  createOrgMemberMock('Alice', 'Johnson', 'alicej', true, false, false),
  createOrgMemberMock('Boluwatife', 'Anderson', 'boband', false, false, true),
  createOrgMemberMock('Janie', 'Will', 'charliew', false, true, false),
] as unknown as OrganisationMember[];
