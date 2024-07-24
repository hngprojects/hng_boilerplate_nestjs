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
        return res.status(HttpStatus.CONFLICT).json({
          status: 'duplicate',
          message: 'Duplicate email!',
          status_code: HttpStatus.CONFLICT,
        });
      }
      const user = await this.waitlistService.create(createWaitlistUserDto);
      await this.waitlistService.sendMail(createWaitlistUserDto.email)
      return res.status(HttpStatus.CREATED).json({
        status: 'success',
        message: 'You are all signed up!',
        user: user,
        status_code: HttpStatus.CREATED,
      });
    } catch (error) {
      res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
        status: 'error',
        message: error.message,
        status_code: HttpStatus.INTERNAL_SERVER_ERROR,
      });
    }
  }
}
