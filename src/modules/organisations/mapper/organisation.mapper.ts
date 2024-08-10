import { Organisation } from '../entities/organisations.entity';

export class OrganisationMapper {
  static mapToResponseFormat(organisation: Organisation) {
    if (!organisation) {
      throw new Error('Organisation entity is required');
    }

    return {
      id: organisation.id,
      name: organisation.name,
      description: organisation.description,
      owner_id: organisation?.owner.id,
      email: organisation.email,
      industry: organisation.industry,
      type: organisation.type,
      country: organisation.country,
      address: organisation.address,
      state: organisation.state,
      created_at: organisation.created_at,
      updated_at: organisation.updated_at,
    };
  }
}
