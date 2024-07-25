import {
  Controller,
  Patch,
  Param,
  Body,
  UsePipes,
  ValidationPipe,
  Request,
  Req,
  Get,
  HttpException,
} from '@nestjs/common';
import UserService from './user.service';
import { UpdateUserDto } from './dto/update-user-dto';
import { UserPayload } from './interfaces/user-payload.interface';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { DeactivateAccountDto } from './dto/deactivate-account.dto';
import { GetUserByIdResponseDto } from './dto/get-user-by-id-response.dto';

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

  @Patch('/deactivate')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Deactivate a user account' })
  @ApiResponse({ status: 200, description: 'The account has been successfully deactivated.' })
  @ApiResponse({ status: 400, description: 'Bad Request.' })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  @ApiResponse({ status: 500, description: 'Internal Server Error.' })
  async deactivateAccount(@Req() request: Request, @Body() deactivateAccountDto: DeactivateAccountDto) {
    const user = request['user'];

    const userId = user.sub;

    const result = await this.userService.deactivateUser(userId, deactivateAccountDto);

    return {
      status_code: 200,
      message: result.message,
    };
  }

  @ApiOperation({ summary: 'Get user' })
  @ApiResponse({
    status: 200,
    description: 'Get user by Id',
    type: GetUserByIdResponseDto,
  })
  @Get(':userId')
  async getUserById(@Param() { userId }: { userId: string }) {
    try {
      const { password, ...userData } = await this.userService.getUserRecord({
        identifier: userId,
        identifierType: 'id',
      });
      return {
        status_code: 200,
        user: userData,
      };
    } catch (e) {
      throw new HttpException(
        {
          status_code: 500,
          error: 'Internal Server Error',
        },
        500
      );
    }
  }
}
