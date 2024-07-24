import { Module } from '@nestjs/common';
import { LanguageService } from './language.service';
import { LanguageController } from './language.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Language } from '../language/entities/language.entity';

@Module({
  controllers: [LanguageController],
  providers: [LanguageService],
  imports: [TypeOrmModule.forFeature([Language])],
})
export class LanguageModule {}
