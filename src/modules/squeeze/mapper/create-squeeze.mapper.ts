import { SqueezeRequestDto } from '../dto/squeeze.dto';
import { Squeeze } from '../entities/squeeze.entity';

export class CreateSqueezeMapper {
  static mapToEntity(dto: SqueezeRequestDto): Squeeze {
    if (!dto) {
      throw new Error('SqueezeRequestDto is required');
    }
    return Object.assign(new Squeeze(), dto);
  }
}
