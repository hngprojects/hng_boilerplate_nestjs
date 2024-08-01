import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Language } from './entities/language.entity';
import { LanguagesService } from './languages.service';
import { LanguagesController } from './languages.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Language])],
  controllers: [LanguagesController],
  providers: [LanguagesService],
})
export class LanguagesModule {}
