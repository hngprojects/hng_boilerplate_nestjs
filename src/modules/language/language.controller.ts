import { Controller, Get, Post, Body, Res, HttpStatus } from '@nestjs/common';
import { LanguageService } from './language.service';
import { CreateLanguageDto } from './dto/create-language.dto';
import { Response } from 'express';
import { ApiOperation, ApiBody, ApiResponse, ApiTags } from '@nestjs/swagger';
import { FETCH_LANGUAGE_FAILURE, LANGUAGE_CREATED_SUCCESSFULLY, OK } from '../../helpers/SystemMessages';
import { createLanguageResponseDto } from './dto/createLanguageReponse.dto';
import { fetchLanguageResponseDto } from './dto/fetchLanguageReponse.dto';

@ApiTags('Language')
@Controller('language')
export class LanguageController {
  constructor(private readonly languageService: LanguageService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new language' })
  @ApiBody({
    description: 'Create Language',
    type: CreateLanguageDto,
  })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: LANGUAGE_CREATED_SUCCESSFULLY,
    type: createLanguageResponseDto,
  })
  async addLanguage(@Body() createLanguageDto: CreateLanguageDto, @Res() response: Response) {
    const createdLanguage = await this.languageService.createLanguage(createLanguageDto);
    return response.status(createdLanguage.status_code).send(createdLanguage);
  }

  @Get()
  @ApiResponse({ status: HttpStatus.OK, description: OK, type: fetchLanguageResponseDto })
  @ApiResponse({ status: HttpStatus.INTERNAL_SERVER_ERROR, description: FETCH_LANGUAGE_FAILURE })
  async getAllLanguages(): Promise<any> {
    return this.languageService.fetchAllLanguages();
  }
}
