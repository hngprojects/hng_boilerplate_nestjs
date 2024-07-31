import { Module } from '@nestjs/common';
import { LanguagesService } from './languages.service';
import { LanguagesController } from './languages.controller';

@Module({
  controllers: [LanguagesController],
  providers: [LanguagesService],
})
export class LanguagesModule {}
