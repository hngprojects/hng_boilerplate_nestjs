import { Controller, Post, Body, BadRequestException, InternalServerErrorException } from '@nestjs/common';
import { SqueezeService } from './squeeze.service';
import { CreateSqueezeDto } from './dto/create-squeeze.dto';
import { plainToClass } from 'class-transformer';
import { validate } from 'class-validator';

@Controller('squeezes')
export class SqueezeController {
  constructor(private readonly squeezeService: SqueezeService) {}

  @Post()
  async create(@Body() createSqueezeDto: CreateSqueezeDto) {
    const dto = plainToClass(CreateSqueezeDto, createSqueezeDto);

    const errors = await validate(dto);
    if (errors.length > 0) {
      throw new BadRequestException({
        message: 'Failed to submit your request',
        status_code: 400,
      });
    }

    try {
      const _ = await this.squeezeService.create(dto);
      return { message: 'Your request has been received. You will get a template shortly.' };
    } catch (err) {
      if (err.code === '23505') {
        throw new BadRequestException('Duplicate entry for email');
      }

      throw new InternalServerErrorException('Failed to create squeeze');
    }
  }
}
