import { Controller, Get, Post, Body, Res, HttpCode, HttpStatus } from '@nestjs/common';
import { TimezonesService } from './timezones.service';
import { CreateTimezoneDto } from './dto/create-timezone.dto';
import { Response } from 'express';

@Controller('timezones')
export class TimezonesController {
  constructor(private readonly timezonesService: TimezonesService) {}

  @Post()
  async createTimezone(@Body() createTimezoneDto: CreateTimezoneDto, @Res() response: Response) {
    const createdTimezone = await this.timezonesService.createTimezone(createTimezoneDto);
    return response.status(createdTimezone.status_code).send(createdTimezone);
  }

  @Get()
  async getTimezones(@Res() response: Response): Promise<any> {
    const timezones = await this.timezonesService.getSupportedTimezones();
    return response.status(timezones.status_code).send(timezones);
  }
}
