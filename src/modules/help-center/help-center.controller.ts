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
import { SuperAdminGuard } from 'src/guards/super-admin.guard';
import { User } from '../user/entities/user.entity';

@ApiTags('help-center')
@Controller('help-center')
export class HelpCenterController {
  constructor(private readonly helpCenterService: HelpCenterService) {}

  @ApiBearerAuth()
  @Post('topics')
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
  @ApiOperation({ summary: 'Update a help center topic by id' })
  @ApiResponse({ status: 200, description: 'Topic updated successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized, please provide valid credentials' })
  @ApiResponse({ status: 403, description: 'Access denied, only authorized users can access this endpoint' })
  @ApiResponse({ status: 404, description: 'Topic not found, please check and try again' })
  @ApiResponse({ status: 500, description: 'Internal Server Error' })
  async update(@Param('id') id: string, @Body() updateHelpCenterDto: UpdateHelpCenterDto) {
    try {
      const updatedHelpCenter = await this.helpCenterService.updateTopic(id, updateHelpCenterDto);
      return {
        success: true,
        message: 'Topic updated successfully',
        data: updatedHelpCenter,
        status_code: HttpStatus.OK,
      };
    } catch (error) {
      if (error.status === HttpStatus.UNAUTHORIZED) {
        throw new HttpException(
          {
            success: false,
            message: 'Unauthorized, please provide valid credentials',
            status_code: HttpStatus.UNAUTHORIZED,
          },
          HttpStatus.UNAUTHORIZED
        );
      } else if (error.status === HttpStatus.FORBIDDEN) {
        throw new HttpException(
          {
            success: false,
            message: 'Access denied, only authorized users can access this endpoint',
            status_code: HttpStatus.FORBIDDEN,
          },
          HttpStatus.FORBIDDEN
        );
      } else if (error.status === HttpStatus.NOT_FOUND) {
        throw new HttpException(
          {
            success: false,
            message: 'Topic not found, please check and try again',
            status_code: HttpStatus.NOT_FOUND,
          },
          HttpStatus.NOT_FOUND
        );
      } else {
        throw new HttpException(
          {
            success: false,
            message: 'Internal Server Error',
          },
          HttpStatus.INTERNAL_SERVER_ERROR
        );
      }
    }
  }

  @ApiBearerAuth()
  @Delete('topics/:id')
  @ApiOperation({ summary: 'Delete a help center topic by id' })
  @ApiResponse({ status: 200, description: 'Topic deleted successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized, please provide valid credentials' })
  @ApiResponse({ status: 403, description: 'Access denied, only authorized users can access this endpoint' })
  @ApiResponse({ status: 404, description: 'Topic not found, please check and try again' })
  @ApiResponse({ status: 500, description: 'Internal Server Error' })
  async remove(@Param('id') id: string) {
    try {
      await this.helpCenterService.removeTopic(id);
      return {
        success: true,
        message: 'Topic deleted successfully',
        status_code: HttpStatus.OK,
      };
    } catch (error) {
      if (error.status === HttpStatus.UNAUTHORIZED) {
        throw new HttpException(
          {
            success: false,
            message: 'Unauthorized, please provide valid credentials',
            status_code: HttpStatus.UNAUTHORIZED,
          },
          HttpStatus.UNAUTHORIZED
        );
      } else if (error.status === HttpStatus.FORBIDDEN) {
        throw new HttpException(
          {
            success: false,
            message: 'Access denied, only authorized users can access this endpoint',
            status_code: HttpStatus.FORBIDDEN,
          },
          HttpStatus.FORBIDDEN
        );
      } else if (error.status === HttpStatus.NOT_FOUND) {
        throw new HttpException(
          {
            success: false,
            message: 'Topic not found, please check and try again',
            status_code: HttpStatus.NOT_FOUND,
          },
          HttpStatus.NOT_FOUND
        );
      } else {
        throw new HttpException(
          {
            success: false,
            message: 'Internal Server Error',
          },
          HttpStatus.INTERNAL_SERVER_ERROR
        );
      }
    }
  }
}
