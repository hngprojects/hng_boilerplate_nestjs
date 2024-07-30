import { User } from '../../user/entities/user.entity';
import { OrganisationRequestDto } from '../dto/organisation.dto';
import { Organisation } from '../entities/organisations.entity';

export class CreateOrganisationMapper {
  // Maps OrganisationRequestDto to Organisation entity
  static mapToEntity(dto: OrganisationRequestDto, owner: User): Organisation {
    if (!dto || !owner) {
      throw new Error('OrganisationRequestDto and owner are required');
    }

    const organisation = new Organisation();
    organisation.name = dto.name;
    organisation.description = dto.description;
    organisation.email = dto.email;
    organisation.industry = dto.industry;
    organisation.type = dto.type;
    organisation.country = dto.country;
    organisation.address = dto.address;
    organisation.state = dto.state;
    organisation.owner = owner;
    organisation.creator = owner;

    return organisation;
  }
}
