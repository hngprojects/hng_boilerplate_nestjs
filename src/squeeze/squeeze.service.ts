import { Injectable } from '@nestjs/common';
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

  async create(createSqueezeDto: CreateSqueezeDto): Promise<Squeeze> {
    const data = this.squeezeRepository.create(createSqueezeDto);

    return this.squeezeRepository.save(data);
  }
}
