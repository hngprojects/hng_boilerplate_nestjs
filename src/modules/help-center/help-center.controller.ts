import {
  Controller,
  Body,
  Patch,
  Param,
  Delete,
  HttpException,
  HttpStatus,
  Get,
  NotFoundException,
  Post,
  Query,
  UseGuards,
  Req,
  HttpCode,
} from '@nestjs/common';
import { HelpCenterService } from './help-center.service';
import { UpdateHelpCenterDto } from './dto/update-help-center.dto';
import { ApiTags, ApiBearerAuth, ApiResponse, ApiOperation } from '@nestjs/swagger';
import { CreateHelpCenterDto } from './dto/create-help-center.dto';
import { GetHelpCenterDto } from './dto/get-help-center.dto';
import { SearchHelpCenterDto } from './dto/search-help-center.dto';
import { HelpCenter } from './interface/help-center.interface';
import { skipAuth } from '../../helpers/skipAuth';
import {
  HelpCenterMultipleInstancResponseType,
  HelpCenterSingleInstancResponseType,
} from './dto/help-center.response.dto';
import { SuperAdminGuard } from '../../guards/super-admin.guard';
import { User } from '../user/entities/user.entity';
import {
  CreateHelpCenterDocs,
  DeleteHelpCenterDocs,
  GetAllHelpCenterDocs,
  GetByIdHelpCenterDocs,
  SearchHelpCenterDocs,
  UpdateHelpCenterDocs,
} from './docs/helpCenter-swagger';
import { CustomHttpException } from '../../helpers/custom-http-filter';
import * as SYS_MSG from '../../helpers/SystemMessages';

@ApiTags('help-center')
@Controller('help-center')
export class HelpCenterController {
  constructor(private readonly helpCenterService: HelpCenterService) {}

  @ApiBearerAuth()
  @Post('topics')
  @UseGuards(SuperAdminGuard)
  @CreateHelpCenterDocs()
  async create(
    @Body() createHelpCenterDto: CreateHelpCenterDto,
    @Req() req: { user: User; language: string }
  ): Promise<HelpCenterSingleInstancResponseType> {
    const user: User = req.user;
    const language = req.language;
    return this.helpCenterService.create(createHelpCenterDto, user, language);
  }

  @skipAuth()
  @Get('topics')
  @GetAllHelpCenterDocs()
  async findAll(@Req() req: any): Promise<HelpCenter[]> {
    const language = req.language;
    return this.helpCenterService.findAll(language);
  }

  @skipAuth()
  @Get('topics/:id')
  @GetByIdHelpCenterDocs()
  async findOne(@Param() params: GetHelpCenterDto): Promise<HelpCenterSingleInstancResponseType> {
    const helpCenter = await this.helpCenterService.findHelpCenter(params.id);
    return helpCenter;
  }

  @skipAuth()
  @Get('topics/search')
  @SearchHelpCenterDocs()
  async search(@Query() query: SearchHelpCenterDto): Promise<HelpCenterMultipleInstancResponseType> {
    return this.helpCenterService.search(query);
  }

  @ApiBearerAuth()
  @Patch('topics/:id')
  @UpdateHelpCenterDocs()
  async update(@Param('id') id: string, @Body() updateHelpCenterDto: UpdateHelpCenterDto) {
    const updatedHelpCenter = await this.helpCenterService.updateTopic(id, updateHelpCenterDto);
    return updatedHelpCenter;
  }

  @ApiBearerAuth()
  @Delete('topics/:id')
  @DeleteHelpCenterDocs()
  async remove(@Param('id') id: string) {
    return await this.helpCenterService.removeTopic(id);
  }
}
