import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
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
import { User } from '@modules/user/entities/user.entity';
import { isUUID } from 'class-validator';

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
  async getLanguagesById(userId: string, user: User): Promise<any> {
    try {
      if (!isUUID(userId)) {
        throw new BadRequestException('Invalid user Id');
      }

      if (user.id !== userId) {
        throw new ForbiddenException({
          status_code: HttpStatus.FORBIDDEN,
          message: 'You are not authorized to access this resource',
        });
      }

      const languages = await this.languageRepository
        .createQueryBuilder('language')
        .innerJoin('language.users', 'user')
        .where('user.id = :userId', { userId })
        .getMany();

      if (!languages || languages.length === 0) {
        throw new NotFoundException({
          status_code: HttpStatus.NOT_FOUND,
          message: 'Languages associated with this user not found',
        });
      }

      const formattedLanguages = languages.map(language => ({
        id: language.id,
        language: language.language,
        description: language.description,
        code: language.code,
      }));

      return {
        status: 'OK',
        status_code: HttpStatus.OK,
        message: 'Languages fetched successfully',
        data: formattedLanguages,
      };
    } catch (error) {
      if (
        error instanceof NotFoundException ||
        error instanceof ForbiddenException ||
        error instanceof BadRequestException
      ) {
        throw error;
      }
      Logger.error('LanguagesServiceError ~ getLanguagesById ~', error);
      throw new InternalServerErrorException({
        message: 'An error occurred',
        status_code: HttpStatus.INTERNAL_SERVER_ERROR,
      });
    }
  }
}
