//////////////////

import {
  Controller,
  Get,
  Patch,
  Param,
  Body,
  HttpStatus,
  Req,
  Res,
  UnauthorizedException,
  ForbiddenException,
  Delete,
  InternalServerErrorException,
  UseInterceptors,
} from '@nestjs/common';
import { ProfileService } from './profile.service';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { DeactivateProfileDto } from './dto/deactivate-profile.dto';
import { Request, Response } from 'express';

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
  async findOneProfile(@Param('userId') userId: string) {
    const profile = await this.profileService.findOneProfile(userId);
    return profile;
  }

  @ApiOperation({ summary: 'Update User Profile' })
  @ApiResponse({
    status: 200,
    description: 'The updated record',
  })
  @Patch(':userId')
  async updateProfile(@Param('userId') userId: string, @Body() body: UpdateProfileDto) {
    const updatedProfile = await this.profileService.updateProfile(userId, body);
    return updatedProfile;
  } // <-- Added missing closing brace

  @ApiOperation({ summary: 'Deactivate User Profile' })
  @ApiResponse({
    status: 200,
    description: 'The profile has been deactivated',
  })
  @Patch('deactivate/:userId')
  async deactivateProfile(@Req() req: Request, @Body() deactivateProfileDto: DeactivateProfileDto) {
    const user = req.user as { id: string };
    const userId = user.id;

    try {
      const updatedProfile = await this.profileService.deactivateProfile(userId, deactivateProfileDto);
      return {
        message: 'Profile successfully deactivated',
        data: updatedProfile,
      };
    } catch (error) {
      if (error instanceof ForbiddenException) {
        throw new UnauthorizedException('Unauthorized access');
      }
      throw new InternalServerErrorException('Something went wrong');
    }
  }

  @ApiOperation({ summary: 'Delete User Profile' })
  @ApiResponse({
    status: 200,
    description: 'The deleted record',
  })
  @Delete(':userId')
  async deleteUserProfile(@Param('userId') userId: string) {
    return await this.profileService.deleteUserProfile(userId);
  }
}
