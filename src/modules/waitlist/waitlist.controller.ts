import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { CreateWaitlistUserDto } from './dto/create-waitlist-user.dto';
import { WaitlistService } from './waitlist.service';

@Controller('api/v1/waitlist')
export class WaitlistController {
  constructor(private readonly waitlistService: WaitlistService) {}

  @Post()
  create(@Body() createWaitlistUserDto: CreateWaitlistUserDto) {
    try {
      const user = this.waitlistService.create(createWaitlistUserDto);
      return {
        status: 'success',
        message: 'User retrieved successfully!',
        user: user,
        status_code: 201,
      };
    } catch (error) {
      return {
        status: 'error',
        message: error.message,
        status_code: 500,
      };
    }
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    try {
      const foundUser = await this.waitlistService.findOne(id);
      if (!foundUser) {
        return {
          status: 'Not found',
          message: 'User not found!',
          status_code: 404,
        };
      }
      return {
        status: 'success',
        message: 'User retrieved successfully!',
        user: foundUser,
        status_code: 200,
      };
    } catch (error) {
      return {
        status: 'error',
        message: error.message,
        status_code: 500,
      };
    }
  }

  @Get()
  async findAll() {
    try {
      const waitlist = await this.waitlistService.findAll();
      if (!waitlist) {
        return {
          status: 'Not found',
          message: 'User not found!',
          status_code: 404,
        };
      }
      return {
        status: 'success',
        message: 'Waitlist retrieved successfully!',
        waitlist,
        status_code: 200,
      };
    } catch (error) {
      return {
        status: 'error',
        message: error.message,
        status_code: 500,
      };
    }
  }
}
