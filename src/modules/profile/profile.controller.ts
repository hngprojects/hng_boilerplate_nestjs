import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { ProfileService } from './profile.service';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { UpdateProfileDto } from './dto/update-profile.dto';

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
  @Get(':userId')
  findOneProfile(@Param('userId') userId: string) {
    const profile = this.profileService.findOneProfile(userId);
    return profile;
  }

  @ApiOperation({ summary: 'Update User Profile' })
  @ApiResponse({
    status: 200,
    description: 'The updated record',
  })
  @Patch(':userId')
  updateProfile(@Param('userId') userId: string, @Body() body: UpdateProfileDto) {
    const updatedProfile = this.profileService.updateProfile(userId, body);
    return updatedProfile;
  }
}
