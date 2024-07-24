import { Controller, Patch, Param, Body, UsePipes, ValidationPipe } from '@nestjs/common';
import UserService from './user.service';
import { UpdateUserDto } from './dto/update-user-dto';

@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Patch(':userId')
  @UsePipes(new ValidationPipe({ whitelist: true, transform: true }))
  async updateUser(@Param('userId') userId: string, @Body() updatedUserDto: UpdateUserDto) {
    return this.userService.updateUser(userId, updatedUserDto);
  }
}
