import { Test, TestingModule } from '@nestjs/testing';
import { LanguageService } from '../language.service';
import dataSource from '../../../database/data-source';
import { getRepositoryToken, TypeOrmModule } from '@nestjs/typeorm';
import { Language } from '../entities/language.entity';
import { Repository } from 'typeorm';
import { mockLanguageRepository } from './language.repository.mock';

describe('LanguageService', () => {
  let service: LanguageService;
  let repository: Repository<Language>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        LanguageService,
        {
          provide: getRepositoryToken(Language),
          useValue: mockLanguageRepository,
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
    repository = module.get<Repository<Language>>(getRepositoryToken(Language));
  }, 10000);

  it('should be defined', () => {
    expect(service).toBeDefined();
  }, 100000);

  it('should create a new language', async () => {
    const language = {
      id: '1f64c4d8-e65e-4c5b-9a9b-988c2b4c6f9f',
      code: 'en',
      name: 'English',
      native_name: 'English',
      direction: 'LTR' as 'LTR' | 'RTL',
      created_at: new Date(),
      updated_at: new Date(),
    };

    jest.spyOn(repository, 'create').mockReturnValue(language);
    jest.spyOn(repository, 'save').mockResolvedValue(language);

    const result = await service.createLanguage(language);
    expect(result).toEqual(language);
    expect(repository.create).toHaveBeenCalledWith(language);
    expect(repository.save).toHaveBeenCalledWith(language);
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

    jest.spyOn(repository, 'find').mockResolvedValue(languages);

    const result = await service.fetchAllLanguages();
    expect(result).toEqual(languages);
  });
});
