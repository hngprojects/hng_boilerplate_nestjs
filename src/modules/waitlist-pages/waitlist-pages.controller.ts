import { Controller, Get, Post, Body, UseGuards, Query } from '@nestjs/common';
import WaitlistPageService from './waitlist-pages.service';
import { ApiBearerAuth, ApiOperation, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';
import { GetWaitlistPageResponseDTO } from './dto/get-waitlist-page.dto';
import { CreateWaitlistPageDTO } from './dto/create-waitlist-page.dto';
import { CreateWaitlistPageResponseDTO } from './dto/create-waitlist-page-response.dto';
import { SuperAdminGuard } from 'src/guards/super-admin.guard';

@UseGuards(SuperAdminGuard)
@ApiBearerAuth()
@ApiTags('Waitlist Pages')
@Controller('waitlist-pages')
export class WaitlistPageController {
  constructor(private readonly waitlistPageService: WaitlistPageService) {}

  @ApiOperation({ summary: 'Create a new waitlist page' })
  @ApiResponse({ status: 201, description: 'Waitlist page created successfully', type: CreateWaitlistPageResponseDTO })
  @ApiResponse({ status: 400, description: 'Bad Request' })
  @ApiResponse({ status: 500, description: 'Internal Server Error' })
  @Post()
  createWaitlistPage(@Body() createWaitlistPageDTO: CreateWaitlistPageDTO): Promise<CreateWaitlistPageResponseDTO> {
    return this.waitlistPageService.createWaitlistPage(createWaitlistPageDTO);
  }

  @ApiOperation({ summary: 'Get all waitlist pages' })
  @ApiResponse({ status: 200, description: 'Waitlist pages retrieved successfully', type: GetWaitlistPageResponseDTO })
  @ApiResponse({ status: 500, description: 'Internal Server Error' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @Get()
  getAllWaitlist(@Query('page') page: number = 1, @Query('limit') limit: number = 10) {
    return this.waitlistPageService.getAllWaitlistPages(page, limit);
  }
}
