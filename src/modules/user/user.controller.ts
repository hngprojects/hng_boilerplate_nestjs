import { Controller, Patch, Param, Body, UsePipes, ValidationPipe, Request } from '@nestjs/common';
import UserService from './user.service';
import { UpdateUserDto } from './dto/update-user-dto';
import { UserPayload } from './interfaces/user-payload.interface';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';

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
}
