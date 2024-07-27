import {
  Controller,
  Patch,
  Param,
  Delete,
  BadRequestException,
  HttpException,
  HttpStatus,
  Body,
  Request,
  Req,
  Get,
  UsePipes,
  ValidationPipe
} from '@nestjs/common';
import UserService from './user.service';
import { UpdateUserDto } from './dto/update-user-dto';
import { UserPayload } from './interfaces/user-payload.interface';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
@ApiBearerAuth()
@ApiTags('Users')
@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

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

  @ApiOperation({ summary: 'Delete User' })
  @ApiResponse({
    status: 200,
    description: 'User deleted successfully',
    type: UpdateUserDto,
  })
  @Delete(':user_id')
  async softDelete(
    @Param('user_id') user_id: string,
    updatedUserDto: UpdateUserDto
  ): Promise<{ status: string; message: string; updatedUserDto }> {
    if (!user_id) {
      throw new BadRequestException('User_id is required');
    }
    try {
      const user = await this.userService.softDelete(user_id);
      const name = user.first_name + ' ' + user.last_name;
      return {
        status: 'success',
        message: 'Account Deleted Successfully',
        updatedUserDto: {
          id: user.id,
          name: name,
          email: user.email,
        },
      };
    } catch (error) {
      throw new HttpException(
        {
          status: 'error',
          message: 'Bad Request',
          status_code: HttpStatus.BAD_REQUEST,
        },
        HttpStatus.BAD_REQUEST
      );
    }
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
}
