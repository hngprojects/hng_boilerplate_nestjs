import { AddMemberToOrganisationDto } from '../dto/add-user-dto';
import { OrganisationMember } from '../entities/org-members.entity';

export class AddMemberToOrganisationMapper {
  static mapToEntity(dto: AddMemberToOrganisationDto): OrganisationMember {
    if (!dto) {
      throw new Error('AddMemberToOrganisationDto is required');
    }
    const orgMember = new OrganisationMember();

    orgMember.user_id = dto.user_id;
    orgMember.organisation_id = dto.organisation_id;
    orgMember.profile_id = dto.profile_id;
    orgMember.role = dto.role;

    return orgMember;
  }
}
