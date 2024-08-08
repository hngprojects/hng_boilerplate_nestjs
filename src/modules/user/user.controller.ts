import {
  Body,
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Query,
  Req,
  Request,
  UseGuards,
  Res,
  StreamableFile,
  Header,
  ParseEnumPipe,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiForbiddenResponse,
  ApiInternalServerErrorResponse,
  ApiOkResponse,
  ApiOperation,
  ApiQuery,
  ApiResponse,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { DeactivateAccountDto } from './dto/deactivate-account.dto';
import { UpdateUserDto } from './dto/update-user-dto';
import { UserPayload } from './interfaces/user-payload.interface';
import UserService from './user.service';
import { SuperAdminGuard } from '../../guards/super-admin.guard';
import { UpdateUserStatusDto } from './dto/update-user-status.dto';
import { UpdateUserStatusResponseDto } from './dto/update-user-status-response.dto';
import { GetUserStatsResponseDto } from './dto/get-user-stats-response.dto';
import { skipAuth } from '../../helpers/skipAuth';
import { Response } from 'express';
import * as path from 'path';
import { UserDataExportDto } from './dto/user-data-export.dto';

@ApiBearerAuth()
@ApiTags('Users')
@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Patch('deactivate')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Deactivate a user account' })
  @ApiResponse({ status: 200, description: 'The account has been successfully deactivated.' })
  @ApiResponse({ status: 400, description: 'Bad Request.' })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  @ApiResponse({ status: 500, description: 'Internal Server Error.' })
  async deactivateAccount(@Req() request: Request, @Body() deactivateAccountDto: DeactivateAccountDto) {
    const user = request['user'];
    const userId = user.sub;

    return this.userService.deactivateUser(userId, deactivateAccountDto);
  }

  @Get('stats')
  @ApiOperation({ summary: 'Get user statistics (Super Admin only)' })
  @ApiResponse({
    status: 200,
    description: 'User statistics retrieved successfully',
    type: GetUserStatsResponseDto,
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiQuery({
    name: 'status',
    required: false,
    enum: ['active', 'inactive', 'deleted'],
    description: 'Filter users by status',
  })
  @UseGuards(SuperAdminGuard)
  async getUserStats(@Query('status') status?: string): Promise<GetUserStatsResponseDto> {
    return this.userService.getUserStats(status);
  }

  @ApiOperation({ summary: 'Update User' })
  @ApiResponse({
    status: 200,
    description: 'User updated seuccessfully',
    type: UpdateUserDto,
  })
  @Patch(':userId')
  async updateUser(
    @Request() req: { user: UserPayload },
    @Param('userId') userId: string,
    @Body() updatedUserDto: UpdateUserDto
  ) {
    return this.userService.updateUser(userId, updatedUserDto, req.user);
  }

  @Get('export')
  async exportUserData(
    @Query() { format }: UserDataExportDto,
    @Res({ passthrough: false }) res: Response,
    @Req() { user }
  ) {
    const file = await this.userService.exportUserDataAsJsonOrExcelFile(format, user.id, res);
    file.getStream().pipe(res);
  }

  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get User Data' })
  @ApiResponse({ status: 200, description: 'User data fetched successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 500, description: 'Internal Server Error' })
  @Get(':id')
  async getUserDataById(@Param('id') id: string) {
    return this.userService.getUserDataWithoutPasswordById(id);
  }

  @UseGuards(SuperAdminGuard)
  @Get()
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get all users (Super Admin only)' })
  @ApiResponse({ status: 200, description: 'Users retrieved successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  async getAllUsers(
    @Request() req: { user: UserPayload },
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 10
  ) {
    return this.userService.getUsersByAdmin(page, limit, req.user);
  }

  @Patch(':userId/status')
  @ApiOperation({ summary: 'Update a user status (Super Admin only)' })
  @ApiOkResponse({ description: 'Status updated successfully', type: UpdateUserStatusResponseDto })
  @ApiUnauthorizedResponse({
    description: 'User is not authorized',
    type: 'object',
    example: {
      message: 'User is currently unauthorized, kindly authenticate to continue',
      status: 401,
    },
  })
  @ApiForbiddenResponse({
    description: 'User is forbidden',
    example: {
      message: 'You dont have the permission to perform this action',
      status: 403,
    },
  })
  @ApiInternalServerErrorResponse({ description: 'Internal Server Error' })
  @UseGuards(SuperAdminGuard)
  async updateUserStatus(@Param('userId', ParseUUIDPipe) userId: string, @Body() { status }: UpdateUserStatusDto) {
    return this.userService.updateUserStatus(userId, status);
  }
}
