import { Injectable, UnprocessableEntityException } from '@nestjs/common';
import { CreateSqueezeDto } from './dto/create-squeeze.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Squeeze } from './entities/squeeze.entity';

@Injectable()
export class SqueezeService {
  constructor(
    @InjectRepository(Squeeze)
    private squeezeRepository: Repository<Squeeze>
  ) {}

  async create(createSqueezeDto: CreateSqueezeDto) {
    const exists = await this.emailExists(createSqueezeDto.email);
    if (exists) {
      throw new UnprocessableEntityException({
        message: 'Squeeze information exists for the provided email',
        status_code: 422,
      });
    }
    const data = this.squeezeRepository.create(createSqueezeDto);

    await this.squeezeRepository.save(data);

    return {
      status_code: 201,
      message: 'Your request has been received. You will get a template shortly.',
    };
  }

  async emailExists(email: string): Promise<boolean> {
    const emailFound = await this.squeezeRepository.findBy({ email });
    return emailFound?.length ? true : false;
  }
}
