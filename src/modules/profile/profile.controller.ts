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
} from '@nestjs/common';
import { ProfileService } from './profile.service';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { DeactivateProfileDto } from './dto/deactivate-profile.dto';
import { Request, Response } from 'express';

@ApiBearerAuth()
@ApiTags('Profile')
@Controller('profile')
@UseInterceptors(ResponseInterceptor)
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
 
  @ApiOperation({ summary: 'Deactivate User Profile' })
  @ApiResponse({
    status: 200,
    description: 'The profile has been deactivated',
  })
  @Patch('deactivate/:userId')
  async deactivateProfile(
    @Req() req: Request,
    @Res() res: Response,
    @Body() deactivateProfileDto: DeactivateProfileDto
  ) {
    const user = req.user as { id: string };
    const userId = user.id;

    try {
      const updatedProfile = await this.profileService.deactivateProfile(userId, deactivateProfileDto);
      res.status(HttpStatus.OK).json({
        message: 'Profile successfully deactivated',
        data: updatedProfile,
      });
    } catch (error) {
      if (error instanceof ForbiddenException) {
        res.status(HttpStatus.FORBIDDEN).json({ message: 'Unauthorized access' });
      } else {
        res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({ message: 'Something went wrong' });
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
