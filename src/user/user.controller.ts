import { Controller, Get, Param } from '@nestjs/common';
import { UserService } from '../user/user.service';
import { User } from '../entities/user.entity';

@Controller('api/v1/user')
export class UserController {
  @Get(':id')
  async findOne(@Param('id') userId: string) {
    return this.UserService.findOne(id);
  }
}
