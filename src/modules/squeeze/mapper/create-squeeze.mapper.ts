import { SqueezeRequestDto } from '../dto/squeeze.dto';
import { Squeeze } from '../entities/squeeze.entity';

export class CreateSqueezeMapper {
  static mapToEntity(dto: SqueezeRequestDto): Squeeze {
    if (!dto) {
      throw new Error('SqueezeRequestDto is required');
    }

    const squeeze = new Squeeze();
    squeeze.company = dto.company;
    squeeze.email = dto.email;
    squeeze.first_name = dto.first_name;
    squeeze.interests = dto.interests;
    squeeze.job_title = dto.job_title;
    squeeze.location = dto.location;
    squeeze.phone = dto.phone;
    squeeze.referral_source = dto.referral_source;

    return squeeze;
  }
}
