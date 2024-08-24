import { Body, Controller, Get, HttpCode, HttpStatus, Post, UseGuards } from '@nestjs/common';
import WaitlistService from './waitlist.service';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { CreateWaitlistDto } from './dto/create-waitlist.dto';
import { WaitlistResponseDto } from './dto/create-waitlist-response.dto';
import { GetWaitlistResponseDto } from './dto/get-waitlist.dto';
import { ErrorResponseDto } from './dto/waitlist-error-response.dto';
import { skipAuth } from '../../helpers/skipAuth';
import { SuperAdminGuard } from '../../guards/super-admin.guard';

@ApiTags('Waitlist')
@Controller('waitlist')
export class WaitlistController {
  constructor(private readonly waitlistService: WaitlistService) {}

  @skipAuth()
  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a new waitlist entry' })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Successfully created a waitlist entry.',
    type: WaitlistResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Invalid input data.',
    type: ErrorResponseDto,
  })
  async createWaitlist(@Body() createWaitlistDto: CreateWaitlistDto): Promise<WaitlistResponseDto> {
    return await this.waitlistService.createWaitlist(createWaitlistDto);
  }

  @ApiBearerAuth()
  @UseGuards(SuperAdminGuard)
  @ApiOperation({ summary: 'Get all waitlist entries' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Successfully retrieved all waitlist entries.',
    type: GetWaitlistResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.INTERNAL_SERVER_ERROR,
    description: 'Internal server error.',
    type: ErrorResponseDto,
  })
  @Get()
  async getAllWaitlist(): Promise<GetWaitlistResponseDto> {
    return this.waitlistService.getAllWaitlist();
  }
}
