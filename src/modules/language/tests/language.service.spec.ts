import { Test, TestingModule } from '@nestjs/testing';
import { LanguageService } from '../language.service';
import dataSource from '../../../database/data-source';
import { getRepositoryToken, TypeOrmModule } from '@nestjs/typeorm';
import { Language } from '../entities/language.entity';
import { mockLanguageRepository } from './language.repository.mock';
import {
  LANGUAGE_ALREADY_EXISTS,
  LANGUAGE_CREATED_SUCCESSFULLY,
  SUCCESS,
  ERROR_OCCURED,
  FETCH_LANGUAGE_FAILURE,
} from '../../../helpers/SystemMessages';
import { HttpStatus } from '@nestjs/common';
describe('LanguageService', () => {
  let service: LanguageService;
  let repository: ReturnType<typeof mockLanguageRepository>;

  beforeEach(async () => {
    repository = mockLanguageRepository();
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        LanguageService,
        {
          provide: getRepositoryToken(Language),
          useValue: repository,
        },
      ],
      imports: [
        TypeOrmModule.forFeature([Language]),
        TypeOrmModule.forRootAsync({
          useFactory: async () => ({
            ...dataSource.options,
          }),
          dataSourceFactory: async () => dataSource,
        }),
      ],
    }).compile();

    service = module.get<LanguageService>(LanguageService);
  }, 1000000);

  it('should be defined', () => {
    expect(service).toBeDefined();
  }, 1000000);

  it('should create a new language', async () => {
    const language = {
      id: '1f64c4d8-e65e-4c5b-9a9b-988c2b4c6f9f',
      code: 'en1',
      name: 'English',
      native_name: 'English',
      direction: 'LTR' as 'LTR' | 'RTL',
      created_at: '2024-07-24T14:24:52.808Z',
      updated_at: '2024-07-24T14:24:52.808Z',
    };

    repository.create.mockReturnValue(language);
    repository.save.mockResolvedValue(language);

    const result = await service.createLanguage(language);
    expect(result).toEqual({
      language: language,
      message: LANGUAGE_CREATED_SUCCESSFULLY,
      status_code: HttpStatus.CREATED,
    });
    expect(repository.create).toHaveBeenCalledWith(language);
    expect(repository.save).toHaveBeenCalledWith(language);
  }, 100000);

  it('should return an error if language already exists', async () => {
    const language = {
      code: 'en1',
    };

    repository.findOne.mockResolvedValue(language);

    const result = await service.createLanguage(language as any);

    expect(result).toEqual({
      status_code: HttpStatus.BAD_REQUEST,
      message: LANGUAGE_ALREADY_EXISTS,
    });
    expect(repository.findOne).toHaveBeenCalledWith({ where: { code: language.code } });
  });

  it('should handle errors during language creation', async () => {
    const language = {
      code: 'en1',
    };

    repository.findOne.mockRejectedValue(new Error('Test error'));

    try {
      await service.createLanguage(language as any);
    } catch (error) {
      expect(error.response).toEqual({
        message: ERROR_OCCURED,
        status_code: HttpStatus.INTERNAL_SERVER_ERROR,
      });
    }
  });

  it('should return an array of languages', async () => {
    const languages = [
      {
        id: '5c2b8f39-6e5e-412e-9407-f5b5e2d5f7c3',
        code: 'fr',
        name: 'French',
        native_name: 'Français',
        direction: 'LTR' as 'LTR' | 'RTL',
        created_at: new Date(),
        updated_at: new Date(),
      },
    ];

    repository.find.mockResolvedValue(languages);

    const result = await service.fetchAllLanguages();
    expect(result).toEqual({
      languages,
      message: SUCCESS,
      status_code: HttpStatus.OK,
    });
  }, 100000);

  it('should handle errors during fetching all languages', async () => {
    repository.find.mockRejectedValue(new Error('Test error'));

    try {
      await service.fetchAllLanguages();
    } catch (error) {
      expect(error.response).toEqual({
        message: FETCH_LANGUAGE_FAILURE,
        status_code: HttpStatus.INTERNAL_SERVER_ERROR,
      });
    }
  });
});
