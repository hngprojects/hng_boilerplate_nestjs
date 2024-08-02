import {
  ConflictException,
  HttpException,
  HttpStatus,
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Language } from './entities/language.entity';
import { CreateLanguageDto, UpdateLanguageDto } from './dto/create-language.dto';

@Injectable()
export class LanguagesService {
  constructor(
    @InjectRepository(Language)
    private readonly languageRepository: Repository<Language>
  ) {}

  async createLanguage(createLanguageDto: CreateLanguageDto): Promise<any> {
    try {
      const languageExists = await this.languageRepository.findOne({
        where: { language: createLanguageDto.language },
      });

      if (languageExists) {
        throw new ConflictException({
          status_code: HttpStatus.CONFLICT,
          message: 'Language already exists',
        });
      }

      const newLanguage = this.languageRepository.create(createLanguageDto);
      await this.languageRepository.save(newLanguage);

      return {
        status_code: HttpStatus.CREATED,
        message: 'Language Created Successfully',
        language: newLanguage,
      };
    } catch (error) {
      if (error instanceof ConflictException) {
        throw error;
      }
      Logger.error('LanguagesServiceError ~ createLanguage ~', error);
      throw new InternalServerErrorException({
        message: 'An error occurred',
        status_code: HttpStatus.INTERNAL_SERVER_ERROR,
      });
    }
  }

  async getSupportedLanguages(): Promise<any> {
    try {
      const languages = await this.languageRepository.find();
      const formattedLanguages = languages.map(language => ({
        language: `${language.language} (${language.description})`,
      }));
      return {
        status_code: HttpStatus.OK,
        message: 'Languages fetched successfully',
        languages: formattedLanguages,
      };
    } catch (error) {
      Logger.error('LanguagesServiceError ~ fetchLanguages ~', error);
      throw new InternalServerErrorException({
        message: 'An error occurred',
        status_code: HttpStatus.INTERNAL_SERVER_ERROR,
      });
    }
  }

  async updateLanguage(id: string, updateLanguageDto: UpdateLanguageDto): Promise<any> {
    try {
      const language = await this.languageRepository.findOne({ where: { id } });
      if (!language) {
        throw new NotFoundException({
          status_code: HttpStatus.NOT_FOUND,
          message: 'Language not found',
        });
      }

      Object.assign(language, updateLanguageDto);
      await this.languageRepository.save(language);

      return {
        status_code: HttpStatus.OK,
        message: 'Language successfully updated',
        language,
      };
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      Logger.error('LanguagesServiceError ~ updateLanguage ~', error);
      throw new InternalServerErrorException({
        message: 'An error occurred',
        status_code: HttpStatus.INTERNAL_SERVER_ERROR,
      });
    }
  }
}
