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
  MaxFileSizeValidator,
  FileTypeValidator,
  Req,
  Res,
  Body,
} from '@nestjs/common';
import { ProfileService } from './profile.service';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Express } from 'express';
import { FileInterceptor } from '@nestjs/platform-express';
import * as path from 'path';
import { skipAuth } from '../../helpers/skipAuth';
import { UpdateProfileDto } from './dto/update-profile.dto';

const uploadProfilePicFolder = path.join(process.cwd(), '/public/uploads/user-profile-img');

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
  @ApiResponse({
    status: 204,
    description: 'Image updated successfully',
  })
  @Put('pic')
  @UseInterceptors(
    FileInterceptor('profile_pic_url', {
      dest: uploadProfilePicFolder,
      limits: { fileSize: 3000000 },
    })
  )
  async updateProfilePic(
    @UploadedFile(
      new ParseFilePipe({
        validators: [new MaxFileSizeValidator({ maxSize: 5000000 }), new FileTypeValidator({ fileType: 'image/*' })],
      })
    )
    file: Express.Multer.File,
    @Req() req
  ) {
    const userId = req.user.id;
    const url = `${req.protocol}://${req.hostname}:${process.env.PORT}${req.url}`;
    return await this.profileService.updateUserProfilePicture(file, userId, url, uploadProfilePicFolder);
  }

  @Get('pic/:picName')
  async getProfilePic(@Param('picName') picName: string, @Res() res) {
    return await this.profileService.getProfilePic(picName, res, uploadProfilePicFolder);
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
