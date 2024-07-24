import { Controller, Get, Res, Req, Query, UseGuards, InternalServerErrorException } from '@nestjs/common';
import { Response, Request } from 'express';
import { ExportService } from './export.service';
import { AuthGuard } from 'src/guards/auth.guard';
import { User } from '../user/entities/user.entity';
import { ApiTags, ApiOperation, ApiQuery, ApiResponse } from '@nestjs/swagger';

@ApiTags('export')
@Controller('export')
@UseGuards(AuthGuard)
export class ExportController {
  constructor(private readonly exportService: ExportService) {}

  @Get('user')
  @ApiOperation({ summary: 'Export user data' })
  @ApiQuery({ name: 'userId', required: true, type: String, description: 'User ID to export' })
  @ApiResponse({ status: 200, description: 'User data exported successfully', type: User })
  @ApiResponse({ status: 400, description: 'User ID is required' })
  @ApiResponse({ status: 404, description: 'User not found' })
  @ApiResponse({ status: 500, description: 'Internal Server Error' })
  async exportUserData(@Query('userId') userId: string, @Res() res: Response) {
    try {
      const userData = await this.exportService.getUserData(userId);
      const jsonData = await this.exportService.exportToJson(userData);
      res.setHeader('Content-Type', 'application/json');
      res.send(jsonData);
    } catch (error) {
      throw new InternalServerErrorException('An error occured');
    }
  }
}
