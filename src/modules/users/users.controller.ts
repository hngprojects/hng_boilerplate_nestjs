import { Controller, Patch, Body, UseGuards, Res, HttpStatus } from '@nestjs/common';
import { Response } from 'express';
import { UpdatePasswordDto } from './dto/update-password.dto';
import { UsersService } from './users.service';
import { JwtAuthGuard } from '../../auth/jwt-auth.guard';
import { GetUser } from '../../decorators/get-user.decorator';

@Controller('api/v1/users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Patch('password-update')
  @UseGuards(JwtAuthGuard)
  async updatePassword(
    @GetUser() user: any,
    @Body() updatePasswordDto: UpdatePasswordDto,
    @Res() res: Response
  ): Promise<void> {
    if (!user) {
      res.status(HttpStatus.UNAUTHORIZED).json({
        status_code: HttpStatus.UNAUTHORIZED,
        message: 'Unauthorized',
        error: 'User not found',
      });
    }

    try {
      await this.usersService.updatePassword(user.id, updatePasswordDto);

      res.status(HttpStatus.OK).json({
        status_code: HttpStatus.OK,
        message: 'Password updated successfully',
      });
    } catch (error) {
      res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
        status_code: HttpStatus.INTERNAL_SERVER_ERROR,
        message: 'An error occurred while updating the password',
        error: error.message,
      });
    }
  }
}
