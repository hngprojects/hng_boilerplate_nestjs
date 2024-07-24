import { Controller, Get, Post, Body, Res, HttpCode, HttpStatus } from '@nestjs/common';
import { LanguageService } from './language.service';
import { CreateLanguageDto } from './dto/create-language.dto';
import { Response } from 'express';
import { skipAuth } from '../../helpers/skipAuth';

@skipAuth()
@Controller('language')
export class LanguageController {
  constructor(private readonly languageService: LanguageService) {}

  @Post()
  async addLanguage(@Body() createLanguageDto: CreateLanguageDto, @Res() response: Response) {
    const createdLanguage = await this.languageService.createLanguage(createLanguageDto);
    return response.status(createdLanguage.status_code).send(createdLanguage);
  }

  @Get()
  async getAllLanguages(): Promise<any> {
    return this.languageService.fetchAllLanguages();
  }
}
