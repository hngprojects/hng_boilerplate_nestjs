import {
  Controller,
  Body,
  Patch,
  Param,
  Delete,
  Get,
  NotFoundException,
  Post,
  Query,
  UseGuards,
  Req,
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

@ApiTags('help-center')
@Controller('help-center')
export class HelpCenterController {
  constructor(private readonly helpCenterService: HelpCenterService) {}

  @ApiBearerAuth()
  @Post('topics')
  @UseGuards(SuperAdminGuard)
  @ApiOperation({ summary: 'Create a new help center topic' })
  @ApiResponse({ status: 201, description: 'The topic has been successfully created.' })
  @ApiResponse({ status: 400, description: 'Invalid input data.' })
  @ApiResponse({ status: 400, description: 'This question already exists.' })
  async create(
    @Body() createHelpCenterDto: CreateHelpCenterDto,
    @Req() req: { user: User }
  ): Promise<HelpCenterSingleInstancResponseType> {
    const user: User = req.user;
    return this.helpCenterService.create(createHelpCenterDto, user);
  }

  @skipAuth()
  @Get('topics')
  @ApiOperation({ summary: 'Get all help center topics' })
  @ApiResponse({ status: 200, description: 'The found records' })
  async findAll(): Promise<HelpCenter[]> {
    return this.helpCenterService.findAll();
  }

  @skipAuth()
  @Get('topics/:id')
  @ApiOperation({ summary: 'Get a help center topic by ID' })
  @ApiResponse({ status: 200, description: 'The found record' })
  @ApiResponse({ status: 404, description: 'Topic not found' })
  async findOne(@Param() params: GetHelpCenterDto): Promise<HelpCenterSingleInstancResponseType> {
    const helpCenter = await this.helpCenterService.findOne(params.id);
    if (!helpCenter) {
      throw new NotFoundException(`Help center topic with ID ${params.id} not found`);
    }
    return helpCenter;
  }

  @skipAuth()
  @Get('topics/search')
  @ApiOperation({ summary: 'Search help center topics' })
  @ApiResponse({ status: 200, description: 'The found records' })
  @ApiResponse({ status: 422, description: 'Invalid search criteria.' })
  async search(@Query() query: SearchHelpCenterDto): Promise<HelpCenterMultipleInstancResponseType> {
    return this.helpCenterService.search(query);
  }

  @ApiBearerAuth()
  @Patch('topics/:id')
  @UseGuards(SuperAdminGuard)
  @ApiOperation({ summary: 'Update a help center topic by id' })
  @ApiResponse({ status: 200, description: 'Topic updated successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized, please provide valid credentials' })
  @ApiResponse({ status: 403, description: 'Access denied, only authorized users can access this endpoint' })
  @ApiResponse({ status: 404, description: 'Topic not found, please check and try again' })
  @ApiResponse({ status: 500, description: 'Internal Server Error' })
  async update(@Param('id') id: string, @Body() updateHelpCenterDto: UpdateHelpCenterDto) {
    return this.helpCenterService.updateTopic(id, updateHelpCenterDto);
  }

  @ApiBearerAuth()
  @Delete('topics/:id')
  @UseGuards(SuperAdminGuard)
  @ApiOperation({ summary: 'Delete a help center topic by id' })
  @ApiResponse({ status: 200, description: 'Topic deleted successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized, please provide valid credentials' })
  @ApiResponse({ status: 403, description: 'Access denied, only authorized users can access this endpoint' })
  @ApiResponse({ status: 404, description: 'Topic not found, please check and try again' })
  @ApiResponse({ status: 500, description: 'Internal Server Error' })
  async remove(@Param('id') id: string) {
    return this.helpCenterService.removeTopic(id);
  }
}
