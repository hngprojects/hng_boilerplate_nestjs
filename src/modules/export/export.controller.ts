import { Controller, Get, Res, Req, UseGuards } from '@nestjs/common';
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
  async exportUserData(@Req() req: Request, @Res() res: Response) {
    const userId = req.query.userId as string;
    if (!userId) {
      return res.status(400).json({
        statusCode: 400,
        message: 'User ID is required',
        error: 'Bad Request',
      });
    }

    try {
      const userData = await this.exportService.getUserData(userId);
      if (!userData) {
        return res.status(404).json({
          statusCode: 404,
          message: 'User not found',
          error: 'Not Found',
        });
      }
      const jsonData = await this.exportService.exportToJson(userData);
      res.setHeader('Content-Type', 'application/json');
      res.send(jsonData);
    } catch (error) {
      return res.status(500).json({
        statusCode: 500,
        message: error.message,
        error: 'Internal Server Error',
      });
    }
  }
}
