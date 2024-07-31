import { Body, Controller, Get, Post } from '@nestjs/common';
import { skipAuth } from '../../helpers/skipAuth';
import WaitlistService from './waitlist.service';
import { AddToWaitlistRequestDto } from './dto/add-to-waitlist-request.dto';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { AddToWaitlistResponseDto } from './dto/add-to-waitlist-response.dto';

@ApiBearerAuth()
@ApiTags('Waitlist')
@Controller('waitlist')
export class WaitlistController {
  constructor(private readonly waitlistService: WaitlistService) {}

  @ApiOperation({ summary: 'Add an email to waitlist' })
  @ApiResponse({ status: 201, description: 'Added to waitlist', type: AddToWaitlistResponseDto })
  @ApiResponse({ status: 400, description: 'Bad Request' })
  @ApiResponse({ status: 409, description: 'Duplicate signup' })
  @ApiResponse({ status: 500, description: 'Internal' })
  @skipAuth()
  @Post()
  addToWaitlist(@Body() addToWaitlistRequestDto: AddToWaitlistRequestDto) {
    return this.waitlistService.addToWaitlist(addToWaitlistRequestDto);
  }

  @Get()
  getAllWaitlist() {
    return this.waitlistService.getAllWaitlist();
  }
}
