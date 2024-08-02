import { Body, Controller, Get, HttpException, HttpStatus, Param, Post, Res } from '@nestjs/common';
import { CreateWaitlistUserDto } from './dto/create-waitlist-user.dto';
import { WaitlistService } from './waitlist.service';
import { Response } from 'express';
import { skipAuth } from 'src/helpers/skipAuth';

import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { GetWaitlistResponseDto } from './dto/get-waitlist.dto';

@ApiBearerAuth()
@ApiTags('Waitlist')
@Controller('waitlist')
export class WaitlistController {
  constructor(private readonly waitlistService: WaitlistService) {}

  @skipAuth()
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
