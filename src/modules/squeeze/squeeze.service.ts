import { BadRequestException, Injectable, UnprocessableEntityException } from '@nestjs/common';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { Squeeze } from './entities/squeeze.entity';
import { SqueezeRequestDto } from './dto/squeeze.dto';
import { CreateSqueezeMapper } from './mapper/create-squeeze.mapper';
import { SqueezeMapper } from './mapper/squeeze.mapper';

@Injectable()
export class SqueezeService {
  constructor(
    @InjectRepository(Squeeze)
    private readonly SqueezeRepository: Repository<Squeeze>
  ) {}

  async create(createSqueezeDto: SqueezeRequestDto) {
    try {
      const mapNewSqueeze = CreateSqueezeMapper.mapToEntity(createSqueezeDto);
      const newSqueeze = this.SqueezeRepository.create({
        ...mapNewSqueeze,
      });
      await this.SqueezeRepository.save(newSqueeze);
      const mappedResponse = SqueezeMapper.mapToResponseFormat(newSqueeze);
      return {
        status: 'success',
        message: 'Your request has been received. You will get a template shortly.',
        data: mappedResponse,
      };
    } catch (error) {
      throw new BadRequestException({
        message: 'Failed to submit your request',
        status_code: 400,
      });
    }
  }
}
