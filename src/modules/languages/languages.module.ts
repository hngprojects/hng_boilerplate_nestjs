import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Language } from './entities/language.entity';
import { LanguagesService } from './languages.service';
import { LanguagesController } from './languages.controller';
import { User } from '@modules/user/entities/user.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Language, User])],
  controllers: [LanguagesController],
  providers: [LanguagesService],
})
export class LanguagesModule {}
