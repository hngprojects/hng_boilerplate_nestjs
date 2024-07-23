import { Body, Controller, Get, HttpException, HttpStatus, Param, Post, Res } from '@nestjs/common';
import { CreateWaitlistUserDto } from './dto/create-waitlist-user.dto';
import { WaitlistService } from './waitlist.service';
import { Response } from 'express';

@Controller('waitlist')
export class WaitlistController {
  constructor(private readonly waitlistService: WaitlistService) {}

  @Post()
  async create(@Body() createWaitlistUserDto: CreateWaitlistUserDto, @Res() res: Response) {
    try {
      const emailExist = await this.waitlistService.emailExist(createWaitlistUserDto.email);
      if (emailExist) {
        return res.status(409).json({
          status: 'duplicate',
          message: 'Duplicate email!',
          status_code: 400,
        });
      }
      const user = await this.waitlistService.create(createWaitlistUserDto);
      return res.status(201).json({
        status: 'success',
        message: 'You are all signed up!',
        user: user,
        status_code: 201,
      });
    } catch (error) {
      res.status(500).json({
        status: 'error',
        message: error.message,
        status_code: 500,
      });
    }
  }
}
