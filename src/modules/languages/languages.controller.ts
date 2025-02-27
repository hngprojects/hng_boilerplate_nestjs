import { Body, Controller, Get, HttpStatus, Param, Patch, Post, Request, Res } from '@nestjs/common';
import { ApiBearerAuth, ApiBody, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { response, Response } from 'express';
import { CreateLanguageDto, UpdateLanguageDto } from './dto/create-language.dto';
import { LanguagesService } from './languages.service';

@ApiTags('Languages')
@Controller('languages')
export class LanguagesController {
  constructor(private readonly languagesService: LanguagesService) {}

  @Post()
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create a new language' })
  @ApiBody({ type: CreateLanguageDto })
  @ApiResponse({ status: 201, description: 'Language successfully created.' })
  @ApiResponse({ status: 409, description: 'Language already exists.' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async createLanguage(@Body() createLanguageDto: CreateLanguageDto) {
    return this.languagesService.createLanguage(createLanguageDto);
  }

  @Get()
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get all supported languages' })
  @ApiResponse({ status: 200, description: 'List of supported languages.' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async getLanguages(@Res() response: Response): Promise<any> {
    const result = await this.languagesService.getSupportedLanguages();
    return response.status(result.status_code).json(result);
  }

  @Get(':id')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get all languages from a userId' })
  @ApiResponse({ status: 200, description: 'List of  languages by the user.' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 400, description: 'Invalid UserId' })
  @ApiResponse({ status: 404, description: 'No languages found for the specified user' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  async getLanguagesByUserId(@Param('id') id: string, @Request() req): Promise<any> {
    const result = await this.languagesService.getLanguagesById(id, req.user);
    return response.status(result.status_code).json(result);
  }

  @Patch(':id')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update a language' })
  @ApiBody({ type: UpdateLanguageDto })
  @ApiResponse({ status: 200, description: 'Language successfully updated.' })
  @ApiResponse({ status: 404, description: 'Language not found.' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async updateLanguage(@Param('id') id: string, @Body() updateLanguageDto: UpdateLanguageDto) {
    return this.languagesService.updateLanguage(id, updateLanguageDto);
  }
}
