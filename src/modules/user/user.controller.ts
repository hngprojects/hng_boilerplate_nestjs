import { Body, Controller, Patch, Headers, HttpStatus, HttpException, UseGuards, Req } from '@nestjs/common';
import UserService from './user.service';
import { DeactivateAccountDto } from './dto/deactivate-account.dto';
import { JwtService } from '@nestjs/jwt';

@Controller('')
export class UserController {
  constructor(
    private readonly userService: UserService,
    private readonly jwtService: JwtService
  ) {}

  @Patch('/accounts/deactivate')
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
