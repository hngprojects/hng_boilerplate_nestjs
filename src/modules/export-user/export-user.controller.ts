import {
    Controller,
    Get,
    Query,
    InternalServerErrorException,
    NotFoundException
} from '@nestjs/common';
import { ExportUserService } from './export-user.service';
import { User } from '../user/entities/user.entity';
import { ApiTags, ApiOperation, ApiQuery, ApiResponse } from '@nestjs/swagger';


@ApiTags('export')
@Controller('export')
export class ExportUserController {
  constructor(private readonly exportUserService: ExportUserService) {}

  @Get('user')
  @ApiOperation({ summary: 'Export user data' })
  @ApiQuery({ name: 'userId', required: true, type: String, description: 'User ID to export' })
  @ApiResponse({ status: 200, description: 'User data exported successfully', type: User })
  @ApiResponse({ status: 400, description: 'User ID is required' })
  @ApiResponse({ status: 404, description: 'User not found' })
  @ApiResponse({ status: 500, description: 'Internal Server Error' })
  async exportUserData(@Query('userId') userId: string) {
    try {
      const userData = await this.exportUserService.getUserData(userId);
      const jsonData = await this.exportUserService.exportToJson(userData);
      return {
        status: 'success',
        data: jsonData
      };
    } catch (error) {
      if (error.message == 'User not found'){
        throw new NotFoundException('User not found')
      } else {
        throw new InternalServerErrorException('An unexpected error occurred');
      }  
    }
  }
}
