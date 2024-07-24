import { Test, TestingModule } from '@nestjs/testing';
import { LanguageController } from '../language.controller';
import { LanguageService } from '../language.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Language } from '../entities/language.entity';
import dataSource from '../../../database/data-source';

describe('LanguageController', () => {
  let controller: LanguageController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [LanguageController],
      providers: [LanguageService],
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

    controller = module.get<LanguageController>(LanguageController);
  }, 10000);

  it('should be defined', () => {
    expect(controller).toBeDefined();
  }, 10000);
});
