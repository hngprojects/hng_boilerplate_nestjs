import { User } from '../../user/entities/user.entity';

export class OrganisationMemberMapper {
  static mapToResponseFormat(member: User) {
    console.log(member);
    if (!member) {
      throw new Error('User entity is required');
    }

    return {
      id: member.id,
      name: `${member.first_name} ${member.last_name}`,
      phone_number: member.phone,
      email: member.email,
    };
  }
}
