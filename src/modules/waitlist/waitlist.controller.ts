import { Body, Controller, Get, HttpCode, HttpStatus, Post, UseGuards } from '@nestjs/common';
import WaitlistService from './waitlist.service';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { CreateWaitlistDto } from './dto/create-waitlist.dto';
import { WaitlistResponseDto } from './dto/create-waitlist-response.dto';
import { GetWaitlistResponseDto } from './dto/get-waitlist.dto';
import { ErrorResponseDto } from './dto/waitlist-error-response.dto';
import { skipAuth } from '../../helpers/skipAuth';
import { SuperAdminGuard } from '../../guards/super-admin.guard';
import { createWaitlistDocs, getAllWaitlistDocs } from './docs/waitlist-swagger.docs';

@ApiTags('Waitlist')
@Controller('waitlist')
export class WaitlistController {
  constructor(private readonly waitlistService: WaitlistService) {}

  @Post()
  @skipAuth()
  @createWaitlistDocs()
  @HttpCode(HttpStatus.CREATED)
  async createWaitlist(@Body() createWaitlistDto: CreateWaitlistDto): Promise<WaitlistResponseDto> {
    return await this.waitlistService.createWaitlist(createWaitlistDto);
  }

  @Get()
  @UseGuards(SuperAdminGuard)
  @getAllWaitlistDocs()
  async getAllWaitlist(): Promise<GetWaitlistResponseDto> {
    return this.waitlistService.getAllWaitlist();
  }
}
