import { Squeeze } from '../entities/squeeze.entity';

export class SqueezeMapper {
  static mapToResponseFormat(squeeze: Squeeze) {
    if (!squeeze) {
      throw new Error('Squeeze entity is required');
    }

    return {
      id: squeeze.id,
      company: squeeze.company,
      email: squeeze.email,
      first_name: squeeze.first_name,
      interests: squeeze.interests,
      job_title: squeeze.job_title,
      location: squeeze.location,
      phone: squeeze.phone,
      referral_source: squeeze.referral_source,
      created_at: squeeze.created_at,
      updated_at: squeeze.updated_at,
    };
  }
}
