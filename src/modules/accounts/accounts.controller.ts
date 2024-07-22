import { Controller, Body, Patch, Headers, HttpException, HttpStatus } from '@nestjs/common';
import { AccountsService } from './accounts.service';
import { CreateAccountDto } from './dto/create-account.dto';
import { UpdateAccountDto } from './dto/update-account.dto';
import { JwtService } from '@nestjs/jwt';
import { DeactivateAccountDto } from './dto/deactivation-account.dto';

@Controller('accounts')
export class AccountsController {
  constructor(private readonly accountsService: AccountsService) {}

  @Patch('deactivate')
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
      const userId = decodedToken.sub; // Assuming the user ID is stored in 'sub' field

      const user = await this.accountsService.findById(userId);

      if (!user) {
        throw new HttpException({ status_code: 404, error: 'User not found' }, HttpStatus.NOT_FOUND);
      }

      if (!deactivateAccountDto.confirmation) {
        throw new HttpException(
          {
            status_code: 400,
            error: 'Confirmation needs to be true for deactivation',
          },
          HttpStatus.BAD_REQUEST
        );
      }

      if (user.is_active) {
        throw new HttpException({ status_code: 400, error: 'User has been deactivated' }, HttpStatus.BAD_REQUEST);
      }

      await this.accountsService.deactivateUser(user, deactivateAccountDto.reason);
      // await this.emailService.sendDeactivationEmail(user.email);

      return {
        status_code: 200,
        message: 'Account Deactivated Successfully',
      };
    } catch (error) {
      throw new HttpException({ status_code: 401, error: 'Invalid or expired token' }, HttpStatus.UNAUTHORIZED);
    }
  }
}
