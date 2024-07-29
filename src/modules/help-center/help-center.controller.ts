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
import { HelpCenterService } from './help-center.service';
import { CreateHelpCenterDto } from './create-help-center.dto';

@Controller('help-center')
export class HelpCenterController {
  private readonly logger = new Logger(HelpCenterController.name);

  constructor(private readonly helpCenterService: HelpCenterService) {}

  @Post()
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

  @Get(':id')
  async getById(@Param('id', new ValidationPipe()) id: string) {
    try {
      const helpCenter = await this.helpCenterService.getHelpCenterById(id);
      if (!helpCenter) {
        throw new UnprocessableEntityException('Help center topic not found');
      }
      return {
        success: true,
        data: helpCenter,
        status_code: 200,
      };
    } catch (error) {
      this.logger.error(`Error fetching help center by id (${id}):`, error.message);
      throw new UnprocessableEntityException('Unable to fetch help center topic');
    }
  }
}
