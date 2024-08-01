import {
  Controller,
  Get,
  Post,
  Param,
  Put,
  Patch,
  UseInterceptors,
  UploadedFile,
  ParseFilePipe,
  FileTypeValidator,
  Req,
  Body,
} from '@nestjs/common';
import { ProfileService } from './profile.service';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Express } from 'express';
import { FileInterceptor } from '@nestjs/platform-express';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { validateFileType } from './pic-upload';

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

  @ApiOperation({ summary: 'Update users profile picture' })
  @ApiResponse({ status: 204, description: 'Image updated successfully' })
  @Put('pic')
  @Post('pic')
  @UseInterceptors(FileInterceptor('profile_pic_url', { limits: { fileSize: 3000000 }, fileFilter: validateFileType }))
  async updateProfilePic(@UploadedFile() file: Express.Multer.File, @Req() req: any) {
    const userId = req.user.id ?? req.user.sub;
    return await this.profileService.updateUserProfilePicture(file, userId);
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
