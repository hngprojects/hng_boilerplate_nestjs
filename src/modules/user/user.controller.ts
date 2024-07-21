import { Controller, Get, Post, Body, Patch, Param, Delete, Req, Res, ParseUUIDPipe, HttpStatus } from '@nestjs/common';
import { UserService } from './user.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { User } from '../../entities/user.entity';
import { Request, Response } from 'express';

type PartialUser = Pick<User, 'email' | 'id'>;

interface RequestWithUser extends Request {
  user: PartialUser;
}

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post()
  create(@Body() createUserDto: CreateUserDto) {
    return this.userService.create(createUserDto);
  }

  @Get()
  findAll() {
    return this.userService.findAll();
  }

  @Get(':id')
  async findOne(@Req() request: RequestWithUser, @Res() response: Response, @Param('id', ParseUUIDPipe) id: string) {
    try {
      const userDetails = request.user;
      const user = await this.userService.findOne(id, userDetails);
      return response.status(HttpStatus.OK).send({
        status_code: HttpStatus.OK,
        message: 'User fetched successfully',
        user,
      });
    } catch (error) {
      return response.status(error.response.statusCode || HttpStatus.INTERNAL_SERVER_ERROR).send({
        message: error.response.message,
        status_code: error.response.statusCode || HttpStatus.INTERNAL_SERVER_ERROR,
        error: error.response.name || 'Internal Server Error',
      });
    }
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
    return this.userService.update(+id, updateUserDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.userService.remove(+id);
  }
}
