import {
  ConflictException,
  HttpException,
  HttpStatus,
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Timezone } from './entities/timezone.entity';
import { CreateTimezoneDto } from './dto/create-timezone.dto';
import {
  ERROR_OCCURED,
  TIMEZONE_ALREADY_EXISTS,
  TIMEZONE_CREATED_SUCCESSFULLY,
  SUCCESS,
  FETCH_TIMEZONE_FAILURE,
} from '../../helpers/SystemMessages';

@Injectable()
export class TimezonesService {
  constructor(
    @InjectRepository(Timezone)
    private readonly timezoneRepository: Repository<Timezone>
  ) {}

  async createTimezone(createTimezoneDto: CreateTimezoneDto): Promise<any> {
    try {
      const timezoneExists = await this.timezoneRepository.findOne({
        where: { timezone: createTimezoneDto.timezone },
      });

      if (timezoneExists) {
        throw new ConflictException({
          status_code: HttpStatus.CONFLICT,
          message: TIMEZONE_ALREADY_EXISTS,
        });
      }

      const newTimezone = this.timezoneRepository.create(createTimezoneDto);
      await this.timezoneRepository.save(newTimezone);

      return {
        status_code: HttpStatus.CREATED,
        message: TIMEZONE_CREATED_SUCCESSFULLY,
        timezone: newTimezone,
      };
    } catch (error) {
      Logger.error('TimezonesServiceError ~ createTimezone ~', error);
      throw new InternalServerErrorException({
        message: ERROR_OCCURED,
        status_code: HttpStatus.INTERNAL_SERVER_ERROR,
      });
    }
  }

  async getSupportedTimezones(): Promise<any> {
    try {
      const timezones = await this.timezoneRepository.find();
      return {
        status_code: HttpStatus.OK,
        message: SUCCESS,
        timezones,
      };
    } catch (error) {
      Logger.error('TimezonesServiceError ~ fetchTimezones ~', error);
      throw new InternalServerErrorException({
        message: FETCH_TIMEZONE_FAILURE,
        status_code: HttpStatus.INTERNAL_SERVER_ERROR,
      });
    }
  }
}
