import { Body, Controller, Patch, Headers, HttpStatus, HttpException, UseGuards, Req } from '@nestjs/common';
import UserService from './user.service';
import { DeactivateAccountDto } from './dto/deactivate-account.dto';
import { JwtService } from '@nestjs/jwt';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';

@ApiTags('user')
@Controller('')
export class UserController {
  constructor(
    private readonly userService: UserService,
    private readonly jwtService: JwtService
  ) {}

  @Patch('/accounts/deactivate')
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
}
