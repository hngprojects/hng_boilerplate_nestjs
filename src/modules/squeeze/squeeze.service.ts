import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  HttpStatus,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { Squeeze } from './entities/squeeze.entity';
import { SqueezeRequestDto } from './dto/squeeze.dto';
import { CreateSqueezeMapper } from './mapper/create-squeeze.mapper';
import { SqueezeMapper } from './mapper/squeeze.mapper';
import { UpdateSqueezeDto } from './dto/update-squeeze.dto';
import CustomExceptionHandler from '../../helpers/exceptionHandler';

@Injectable()
export class SqueezeService {
  constructor(
    @InjectRepository(Squeeze)
    private readonly SqueezeRepository: Repository<Squeeze>
  ) {}

  async create(createSqueezeDto: SqueezeRequestDto) {
    try {
      const mapNewSqueeze = CreateSqueezeMapper.mapToEntity(createSqueezeDto);

      const existingSqueeze = this.SqueezeRepository.findOne({
        where: {
          email: mapNewSqueeze.email,
        },
      });

      if (existingSqueeze) {
        throw new ConflictException({
          status_code: HttpStatus.CONFLICT,
          message: 'A squeeze has already been generated using this email',
        });
      }

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
      CustomExceptionHandler(error);

      throw new BadRequestException({
        message: 'Failed to submit your request',
        status_code: 400,
      });
    }
  }

  async updateSqueeze(updateDto: UpdateSqueezeDto) {
    try {
      const squeeze = await this.SqueezeRepository.findOneBy({ email: updateDto.email });

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
      const updatedSqueeze = await this.SqueezeRepository.save(squeeze);
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
