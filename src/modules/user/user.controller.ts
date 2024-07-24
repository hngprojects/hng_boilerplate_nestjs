import { Body, Controller, Patch, Headers, HttpStatus, HttpException } from '@nestjs/common';
import UserService from './user.service';
import { DeactivateAccountDto } from './dto/deactivate-account.dto';
import { JwtService } from '@nestjs/jwt';

@Controller('')
export class UserController {
  constructor(
    private readonly userService: UserService,
    private readonly jwtService: JwtService
  ) {}

  // add guard here
  @Patch('/accounts/deactivate')
  async deactivateAccount(
    @Headers('authorization') authorization: string,
    @Body() deactivateAccountDto: DeactivateAccountDto
  ) {
    if (!authorization) {
      throw new HttpException({ status_code: 401, error: 'Authorization header missing' }, HttpStatus.UNAUTHORIZED);
    }
    const token = authorization.split(' ')[1];

    try {
      const decodedToken = this.jwtService.verify(token);
      const userId = 'ceed29eb-d9ba-4d81-82b2-223f2bfbece3';

      const result = await this.userService.deactivateUser(userId, deactivateAccountDto);

      return {
        status_code: 200,
        message: result.message,
      };
    } catch (error) {
      throw new HttpException(
        { status_code: 401, error: 'Could not validate user credentials' },
        HttpStatus.UNAUTHORIZED
      );
    }
  }
}
