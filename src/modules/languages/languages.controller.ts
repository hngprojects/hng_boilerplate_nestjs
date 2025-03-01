import {
  Controller,
  Post,
  Body,
  Get,
  Patch,
  Param,
  Res,
  Request,
  Response,
  UseGuards,
  BadRequestException,
  Delete,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBody, ApiBearerAuth } from '@nestjs/swagger';
import { CreateLanguageDto, UpdateLanguageDto } from './dto/create-language.dto';
import { LanguagesService } from './languages.service';
import { AuthGuard } from '@guards/auth.guard';
import { NotFoundException, UnauthorizedException } from '@nestjs/common';

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
  async getLanguages(@Response() response): Promise<any> {
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
  async getLanguagesByUserId(@Param('id') id: string, @Request() req, @Response() response): Promise<any> {
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

  @ApiBearerAuth()
  @UseGuards(AuthGuard)
  @ApiOperation({ summary: 'Get all languages by User ID' })
  @ApiResponse({ status: 200, description: 'Returns languages associated with user.' })
  @ApiResponse({ status: 404, description: 'User not found or no languages available.' })
  @ApiResponse({ status: 401, description: 'Unauthorized access.' })
  @Get(':id/languages')
  async getUserLanguages(@Param('id') userId: string) {
    if (!userId) {
      throw new UnauthorizedException('Invalid user ID.');
    }

    const languages = await this.languagesService.getUserLanguages(userId);

    if (!languages.length) {
      throw new NotFoundException('No languages found for this user.');
    }

    return { status: 200, data: languages };
  }

  @Delete(':id')
  @ApiBearerAuth()
  @UseGuards(AuthGuard)
  @ApiOperation({ summary: 'Delete a specific user language by ID' })
  @ApiResponse({ status: 200, description: 'Language successfully deleted for the user.' })
  @ApiResponse({ status: 400, description: 'Cannot delete language due to dependencies.' })
  @ApiResponse({ status: 404, description: 'Language not found for the user.' })
  @ApiResponse({ status: 401, description: 'Unauthorized access.' })
  @ApiResponse({ status: 403, description: 'User not authorized to delete this language.' })
  @HttpCode(HttpStatus.OK)
  async deleteUserLanguage(@Param('id') languageId: string, @Request() req) {
    if (!languageId) {
      throw new BadRequestException('Invalid language ID provided.');
    }
    return await this.languagesService.deleteUserLanguage(languageId, req.user.id);
  }
}
