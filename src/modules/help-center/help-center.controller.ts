import {
  Controller,
  Post,
  Body,
  Get,
  Param,
  UnprocessableEntityException,
  Logger,
  ValidationPipe,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiBody } from '@nestjs/swagger';
import { HelpCenterService } from './help-center.service';
import { CreateHelpCenterDto } from './create-help-center.dto';


@ApiTags('Help Center')
@Controller('help-center')
export class HelpCenterController {
  private readonly logger = new Logger(HelpCenterController.name);

  constructor(private readonly helpCenterService: HelpCenterService) {}

  @Post()
  @ApiOperation({ summary: 'Create a help center topic' })
  @ApiBody({ type: CreateHelpCenterDto })
  @ApiResponse({ status: 201, description: 'The help center topic has been successfully created.' })
  @ApiResponse({ status: 422, description: 'Invalid input data' })
  async create(@Body(new ValidationPipe()) createHelpCenterDto: CreateHelpCenterDto) {
    try {
      const author = 'Admin';
      const helpCenter = await this.helpCenterService.createHelpCenter(createHelpCenterDto, author);
      return {
        success: true,
        data: helpCenter,
        status_code: 201,
      };
    } catch (error) {
      this.logger.error('Error creating help center:', error.message);
      throw new UnprocessableEntityException('Invalid input data');
    }
  }

  @Get()
  @ApiOperation({ summary: 'Get all help center topics' })
  @ApiResponse({ status: 200, description: 'Successfully fetched all help center topics.' })
  @ApiResponse({ status: 422, description: 'Unable to fetch help centers' })
  async getAll() {
    try {
      const helpCenters = await this.helpCenterService.getAllHelpCenters();
      return {
        success: true,
        data: helpCenters,
        status_code: 200,
      };
    } catch (error) {
      this.logger.error('Error fetching all help centers:', error.message);
      throw new UnprocessableEntityException('Unable to fetch help centers');
    }
  }
}
