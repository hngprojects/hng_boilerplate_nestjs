import { ForbiddenException, Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { UpdateSqueezeDto } from './dto/update-squeeze.dto';
import { Repository } from 'typeorm';
import { Squeeze } from './entities/squeeze.entity';
import { InjectRepository } from '@nestjs/typeorm';

@Injectable()
export class SqueezeService {
  constructor(
    @InjectRepository(Squeeze)
    private readonly squeezeRepository: Repository<Squeeze>
  ) {}

  async updateSqueeze(updateDto: UpdateSqueezeDto) {
    try {
      const squeeze = await this.squeezeRepository.findOneBy({ email: updateDto.email });

      if (!squeeze) {
        throw new NotFoundException({
          message: 'No squeeze page record exists for the provided request body',
          status_code: 404,
        });
      }

      if (squeeze.updated_at > squeeze.created_at) {
        throw new ForbiddenException({
          message: 'The squeeze page record can only be updated once.',
          status_code: 403,
        });
      }

      Object.assign(squeeze, updateDto);
      const updatedSqueeze = await this.squeezeRepository.save(squeeze);
      return updatedSqueeze;
    } catch (err) {
      if (this.isInstanceOfAny(err, [ForbiddenException, NotFoundException])) {
        throw err;
      } else {
        throw new InternalServerErrorException({
          message: err.message,
          status_code: 500,
        });
      }
    }
  }

  isInstanceOfAny(err: any, classes: Array<{ new (...args: any[]): any }>): boolean {
    return classes.some(errClass => err instanceof errClass);
  }
}
