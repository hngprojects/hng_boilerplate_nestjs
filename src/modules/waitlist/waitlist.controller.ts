import { Body, Controller, Get, HttpException, HttpStatus, Param, Post, Res } from '@nestjs/common';
import { CreateWaitlistUserDto } from './dto/create-waitlist-user.dto';
import { WaitlistService } from './waitlist.service';
import { Response } from 'express';
import { EmailService } from '../email/email.service';

@Controller('waitlist')
export class WaitlistController {
  constructor(private readonly waitlistService: WaitlistService) {}

  @Post()
  async create(@Body() createWaitlistUserDto: CreateWaitlistUserDto, @Res() res: Response) {
    try {
      const response = await this.waitlistService.create(createWaitlistUserDto);
      return res.status(response.status_code).send(response);
    } catch (error) {
      res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
        message: error.message,
        status_code: HttpStatus.INTERNAL_SERVER_ERROR,
      });
    }
  }
}
