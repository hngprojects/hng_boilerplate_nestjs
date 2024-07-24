import { Controller, Patch, Param, Body, UsePipes, ValidationPipe, UseGuards } from '@nestjs/common';
import UserService from './user.service';
import UpdateUserResponseDTO from './dto/update-user-response.dto';
import { UpdateUserDto } from './dto/update-user-dto';
import { AuthGuard } from 'src/guards/auth.guard';

@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Patch(':userId')
  @UseGuards(AuthGuard)
  @UsePipes(new ValidationPipe({ whitelist: true, transform: true }))
  async updateUser(
    @Param('userId') userId: string,
    @Body() updatedUserDto: UpdateUserDto
  ): Promise<UpdateUserResponseDTO> {
    const updatedUser = await this.userService.updateUser(userId, updatedUserDto);
    return {
      status: 'success',
      message: 'User Updated Successfully',
      user: {
        id: updatedUser.id,
        name: `${updatedUser.first_name} ${updatedUser.last_name}`,
        phone_number: updatedUser.phone_number,
      },
    };
  }
}
