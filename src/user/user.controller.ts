import { Controller, Delete, Param, UseGuards, Req, Res, HttpException, HttpStatus } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { UserService } from './user.service';

@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @UseGuards(AuthGuard('jwt'))
  @Delete(':id')
  async softDelete(@Param('id') id: number, @Req() req, @Res() res): Promise<void> {
    const user = await this.userService.findOne(id);

    if (!user) {
      throw new HttpException(
        {
          status: 'error',
          message: 'Bad Request',
          status_code: 400,
        },
        HttpStatus.BAD_REQUEST
      );
    }

    if (req.user.userId !== id) {
      throw new HttpException(
        {
          status: 'error',
          message: 'Forbidden',
          status_code: 403,
        },
        HttpStatus.FORBIDDEN
      );
    }

    await this.userService.softDelete(id);

    res.status(HttpStatus.NO_CONTENT).json({
      status: 'success',
      message: 'Deletion in progress',
    });
  }
}
