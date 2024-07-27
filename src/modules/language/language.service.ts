import { HttpException, HttpStatus, Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Language } from '../language/entities/language.entity';
import { CreateLanguageDto } from './dto/create-language.dto';
import {
  ERROR_OCCURED,
  LANGUAGE_ALREADY_EXISTS,
  LANGUAGE_CREATED_SUCCESSFULLY,
  OK,
  FETCH_LANGUAGE_FAILURE,
} from '../../helpers/SystemMessages';

@Injectable()
export class LanguageService {
  constructor(
    @InjectRepository(Language)
    private readonly languageRepository: Repository<Language>
  ) {}

  async createLanguage(createLanguageDto: CreateLanguageDto): Promise<any> {
    try {
      const languageExists = await this.languageRepository.findOne({ where: { code: createLanguageDto.code } });

      if (languageExists) {
        return {
          status_code: HttpStatus.CONFLICT,
          message: LANGUAGE_ALREADY_EXISTS,
        };
      }

      const newLanguage = this.languageRepository.create(createLanguageDto);
      await this.languageRepository.save(newLanguage);

      return {
        status_code: HttpStatus.CREATED,
        message: LANGUAGE_CREATED_SUCCESSFULLY,
        language: newLanguage,
      };
    } catch (error) {
      Logger.log('LanguageServiceError ~  createLanguage ~', error);
      throw new HttpException(
        {
          message: ERROR_OCCURED,
          status_code: HttpStatus.INTERNAL_SERVER_ERROR,
        },
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  async fetchAllLanguages(): Promise<any> {
    try {
      const languages = await this.languageRepository.find();
      return {
        status_code: HttpStatus.OK,
        message: OK,
        languages,
      };
    } catch (error) {
      Logger.log('LanguageServiceError ~  fetchLanguages ~', error);
      throw new HttpException(
        {
          message: FETCH_LANGUAGE_FAILURE,
          status_code: HttpStatus.INTERNAL_SERVER_ERROR,
        },
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }
}
