import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '../user/entities/user.entity';
import { Language } from './entities/language.entity';
import { LanguagesController } from './languages.controller';
import { LanguagesService } from './languages.service';

@Module({
  imports: [TypeOrmModule.forFeature([Language, User])],
  controllers: [LanguagesController],
  providers: [LanguagesService],
})
export class LanguagesModule {}
