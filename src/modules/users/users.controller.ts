import { Controller, Patch, Body, Req, UseGuards, UnauthorizedException } from '@nestjs/common';
import { Request } from 'express';
import { UpdatePasswordDto } from './dto/update-password.dto';
import { UsersService } from './users.service';
import { JwtAuthGuard } from '../../auth/jwt-auth.guard';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Patch('password')
  @UseGuards(JwtAuthGuard)
  async updatePassword(
    @Req() req: Request,
    @Body() updatePasswordDto: UpdatePasswordDto,
  ): Promise<void> {
    console.log(req, "gotten here");
    const userId = req.body.user.id;
    if (!userId) {
      throw new UnauthorizedException('User not found');
    }
    await this.usersService.updatePassword(userId, updatePasswordDto);
  }
}
