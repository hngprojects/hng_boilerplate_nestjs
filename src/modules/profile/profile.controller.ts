import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';
import { ProfileService } from './profile.service';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { UserProfileGuard } from '../../guards/authorization.guard';

@ApiBearerAuth()
@ApiTags('Profile')
@Controller('profile')
export class ProfileController {
  constructor(private readonly profileService: ProfileService) {}

  @ApiOperation({ summary: 'Get User Profile' })
  @ApiResponse({
    status: 200,
    description: 'The found record',
  })
  @UseGuards(UserProfileGuard)
  @Get(':userId')
  findOneProfile(@Param('userId') userId: string) {
    const profile = this.profileService.findOneProfile(userId);
    return profile;
  }
}
