import { Controller, Post, Body, Get, Param, Query, NotFoundException, UsePipes, ValidationPipe } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { HelpCenterService } from './help-center.service';
import { CreateHelpCenterDto } from './dto/create-help-center.dto';
import { HelpCenter } from './help-center.interface';
import { GetHelpCenterDto } from './dto/get-help-center.dto';
import { SearchHelpCenterDto } from './dto/search-help-center.dto';

@ApiTags('help-center')
@Controller('help-center')
export class HelpCenterController {
  constructor(private readonly helpCenterService: HelpCenterService) { }

  @Post('help-center/topics')
  @ApiOperation({ summary: 'Create a new help center topic' })
  @ApiResponse({ status: 201, description: 'The topic has been successfully created.' })
  @ApiResponse({ status: 422, description: 'Invalid input data.' })
  @UsePipes(new ValidationPipe({ transform: true, whitelist: true }))
  async create(@Body() createHelpCenterDto: CreateHelpCenterDto): Promise<HelpCenter> {
    return this.helpCenterService.create(createHelpCenterDto);
  }

  @Get('help-center/topics')
  @ApiOperation({ summary: 'Get all help center topics' })
  @ApiResponse({ status: 200, description: 'The found records' })
  async findAll(): Promise<HelpCenter[]> {
    return this.helpCenterService.findAll();
  }

  @Get('help-center/topics/:id')
  @ApiOperation({ summary: 'Get a help center topic by ID' })
  @ApiResponse({ status: 200, description: 'The found record' })
  @ApiResponse({ status: 404, description: 'Topic not found' })
  async findOne(@Param() params: GetHelpCenterDto): Promise<HelpCenter> {
    const helpCenter = await this.helpCenterService.findOne(params.id);
    if (!helpCenter) {
      throw new NotFoundException(`Help center topic with ID ${params.id} not found`);
    }
    return helpCenter;
  }

  @Get('help-center/topics/search')
  @ApiOperation({ summary: 'Search help center topics' })
  @ApiResponse({ status: 200, description: 'The found records' })
  @ApiResponse({ status: 422, description: 'Invalid search criteria.' })
  async search(@Query() query: SearchHelpCenterDto): Promise<HelpCenter[]> {
    return this.helpCenterService.search(query);
  }
}
