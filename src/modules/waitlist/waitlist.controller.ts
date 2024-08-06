import { Controller, Get } from '@nestjs/common';
import WaitlistService from './waitlist.service';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { GetWaitlistResponseDto } from './dto/get-waitlist.dto';

@ApiBearerAuth()
@ApiTags('Waitlist')
@Controller('waitlist')
export class WaitlistController {
  constructor(private readonly waitlistService: WaitlistService) {}

  @ApiOperation({ summary: 'Get all waitlist' })
  @ApiResponse({ status: 200, description: 'Wait list retrieved successfully' })
  @ApiResponse({ status: 500, description: 'Internal Server Error' })
  @Get()
  getAllWaitlist() {
    return this.waitlistService.getAllWaitlist();
  }
}
